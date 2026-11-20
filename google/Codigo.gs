/**
 * COMITÉ AVALON — "Lo que el cliente no dice"
 * Depósito de respuestas en Google Sheets. Pegar en Extensiones → Apps Script de la planilla.
 *
 * Privacidad: no guarda nombres, emails, IP ni datos del dispositivo. Para limitar votos
 * duplicados guarda solo un hash (SHA-256 con sal secreta) de un número aleatorio que genera
 * el celular. Los grupos se guardan por número, nunca con nombres de integrantes.
 *
 * Propiedades del script (Configuración del proyecto → Propiedades del script):
 *   CLAVE_PRESENTADOR  → clave larga que solo tiene la compu de Gerson (abre/cierra votaciones)
 *   SAL                → texto aleatorio largo (para el hash de los tokens)
 */

var HOJAS = {
  votos: ['fecha', 'sesion', 'caso', 'opcion', 'token_hash'],
  lecturas: ['fecha', 'sesion', 'grupo', 'siente', 'busca', 'primera'],
  roleplay: ['fecha', 'sesion', 'grupo', 'comprension', 'fundamento', 'limites', 'solucion', 'acuerdo', 'frase'],
  compromisos: ['fecha', 'sesion', 'grupo', 'regla']
};
var OPCIONES = ['A', 'B', 'C', 'D'];

/* ───────── Lectura (GET) ───────── */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var sesion = limpiar(p.sesion || 'COMITE', 40);
  try {
    if (p.accion === 'estado') return json({ ok: true, estado: leerEstado(sesion), ahora: Date.now() });
    if (p.accion === 'resultados') return json(resultados(sesion));
    return json({ ok: true, servicio: 'Comité Avalon', ahora: Date.now() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ───────── Escritura (POST, body JSON como text/plain) ───────── */
function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'formato' }); }
  var sesion = limpiar(d.sesion || 'COMITE', 40);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (d.accion) {
      case 'votar': return json(votar(sesion, d));
      case 'grupo_unirse': return json(unirse(sesion, d));
      case 'interpretacion': return json(guardarLectura(sesion, d));
      case 'roleplay': return json(guardarRoleplay(sesion, d));
      case 'compromiso': return json(guardarGrupo('compromisos', sesion, d, ['regla']));
      case 'estado': return json(cambiarEstado(sesion, d));
      default: return json({ ok: false, error: 'accion' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
    CacheService.getScriptCache().remove('res:' + sesion);
  }
}

/* ───────── Estado de la sala (lo controla solo la presentación) ───────── */
function leerEstado(sesion) {
  var raw = PropertiesService.getScriptProperties().getProperty('estado:' + sesion);
  var est = raw ? JSON.parse(raw) : { fase: 'espera', caso: null, abierta: false, abiertaEn: 0, duracion: 0 };
  // Cierre automático cuando vence el tiempo
  if (est.abierta && est.duracion && Date.now() > est.abiertaEn + est.duracion * 1000 + 3000) est.abierta = false;
  return est;
}

function cambiarEstado(sesion, d) {
  var clave = PropertiesService.getScriptProperties().getProperty('CLAVE_PRESENTADOR');
  if (!clave || d.clave !== clave) return { ok: false, error: 'clave' };
  var est = leerEstado(sesion);
  if (d.fase !== undefined) est.fase = limpiar(d.fase, 20);
  if (d.caso !== undefined) est.caso = d.caso ? limpiar(d.caso, 10) : null;
  if (d.abierta !== undefined) {
    est.abierta = !!d.abierta;
    if (est.abierta) { est.abiertaEn = Date.now(); est.duracion = Math.max(10, Math.min(3600, Number(d.duracion) || 1800)); }
  }
  PropertiesService.getScriptProperties().setProperty('estado:' + sesion, JSON.stringify(est));
  return { ok: true, estado: est };
}

/* ───────── Actividad 01: voto individual anónimo ───────── */
function votar(sesion, d) {
  var opcion = String(d.opcion || '');
  if (OPCIONES.indexOf(opcion) < 0) return { ok: false, error: 'opcion' };
  var caso = limpiar(d.caso, 12);
  if (!/^[a-z0-9_-]+$/i.test(caso)) return { ok: false, error: 'caso' };
  // La Actividad 01 se responde completa desde el celular mientras está abierta
  var est = leerEstado(sesion);
  if (!est.abierta || est.fase !== 'a1') return { ok: false, error: 'cerrada' };
  var hash = hashToken(d.token);
  if (!hash) return { ok: false, error: 'token' };

  var cache = CacheService.getScriptCache();
  var clave = 'v:' + sesion + ':' + caso + ':' + hash;
  if (cache.get(clave) || yaVoto(sesion, caso, hash)) return { ok: false, error: 'duplicado' };

  hoja('votos').appendRow([new Date(), sesion, caso, opcion, hash]);
  cache.put(clave, '1', 21600);
  return { ok: true };
}

function yaVoto(sesion, caso, hash) {
  var datos = hoja('votos').getDataRange().getValues();
  for (var i = datos.length - 1; i > 0; i--) {
    if (datos[i][1] === sesion && datos[i][2] === caso && datos[i][4] === hash) return true;
  }
  return false;
}

/* ───────── Grupos ───────── */
function unirse(sesion, d) {
  var g = grupoValido(d.grupo);
  if (!g) return { ok: false, error: 'grupo' };
  var cache = CacheService.getScriptCache();
  cache.put('g:' + sesion + ':' + g, String(Date.now()), 21600);
  return { ok: true };
}

function guardarGrupo(nombreHoja, sesion, d, campos) {
  var g = grupoValido(d.grupo);
  if (!g) return { ok: false, error: 'grupo' };
  var fila = [new Date(), sesion, g];
  for (var i = 0; i < campos.length; i++) fila.push(limpiar(d[campos[i]], 1500));
  hoja(nombreHoja).appendRow(fila);
  return { ok: true };
}

/** Actividad 02: una opción (A–D) por pregunta. */
function guardarLectura(sesion, d) {
  var g = grupoValido(d.grupo);
  if (!g) return { ok: false, error: 'grupo' };
  var fila = [new Date(), sesion, g];
  var ok = ['siente', 'busca', 'primera'].every(function (k) { var v = String(d[k] || ''); fila.push(v); return OPCIONES.indexOf(v) >= 0; });
  if (!ok) return { ok: false, error: 'opcion' };
  hoja('lecturas').appendRow(fila);
  return { ok: true };
}

function guardarRoleplay(sesion, d) {
  var g = grupoValido(d.grupo);
  if (!g) return { ok: false, error: 'grupo' };
  var p = ['comprension', 'fundamento', 'limites', 'solucion', 'acuerdo'].map(function (k) {
    var n = Number(d[k]); return n >= 1 && n <= 5 ? n : '';
  });
  hoja('roleplay').appendRow([new Date(), sesion, g].concat(p).concat([limpiar(d.frase, 600)]));
  return { ok: true };
}

/* ───────── Resultados agregados (lo que lee la presentación) ───────── */
function resultados(sesion) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('res:' + sesion);
  if (hit) return JSON.parse(hit);

  var votos = {};
  filas('votos', sesion).forEach(function (r) {
    var c = r[2];
    votos[c] = votos[c] || { A: 0, B: 0, C: 0, D: 0 };
    if (votos[c][r[3]] !== undefined) votos[c][r[3]]++;
  });

  // De cada grupo se usa su última respuesta
  var interp = {};
  filas('lecturas', sesion).forEach(function (r) {
    interp[r[2]] = { siente: r[3], busca: r[4], primera: r[5] };
  });
  var rp = {};
  filas('roleplay', sesion).forEach(function (r) {
    rp[r[2]] = { comprension: r[3], fundamento: r[4], limites: r[5], solucion: r[6], acuerdo: r[7], frase: r[8] };
  });
  var comp = {};
  filas('compromisos', sesion).forEach(function (r) { comp[r[2]] = r[3]; });

  var unidos = [];
  for (var g = 1; g <= 6; g++) if (cache.get('g:' + sesion + ':' + g)) unidos.push(g);

  var out = { ok: true, estado: leerEstado(sesion), votos: votos, interpretaciones: interp, roleplay: rp, compromisos: comp, unidos: unidos, ahora: Date.now() };
  cache.put('res:' + sesion, JSON.stringify(out), 2);
  return out;
}

/* ───────── Utilidades ───────── */
function hoja(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.appendRow(HOJAS[nombre]);
    h.setFrozenRows(1);
  }
  return h;
}
function filas(nombre, sesion) {
  var v = hoja(nombre).getDataRange().getValues();
  return v.slice(1).filter(function (r) { return r[1] === sesion; });
}
function grupoValido(g) { var n = Number(g); return n >= 1 && n <= 6 ? n : 0; }
function limpiar(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function hashToken(t) {
  t = String(t || '');
  if (t.length < 16 || t.length > 80) return '';
  var sal = PropertiesService.getScriptProperties().getProperty('SAL') || 'avalon';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + t);
  return bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('').slice(0, 32);
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ───────── Mantenimiento (ejecutar a mano desde el editor) ───────── */

/** Crea las hojas vacías. Ejecutar una vez después de pegar el código. */
function prepararPlanilla() { Object.keys(HOJAS).forEach(hoja); }

/** Borra solo las respuestas de una sesión de prueba (nunca toca "COMITE"). */
function borrarSesionDePrueba() {
  var sesion = 'PRUEBA';
  Object.keys(HOJAS).forEach(function (n) {
    var h = hoja(n), v = h.getDataRange().getValues();
    for (var i = v.length - 1; i > 0; i--) if (v[i][1] === sesion) h.deleteRow(i + 1);
  });
  PropertiesService.getScriptProperties().deleteProperty('estado:' + sesion);
}

/** Política de retención: borra los tokens de voto (hash) pasados 90 días; quedan solo los conteos. */
function aplicarRetencion() {
  var h = hoja('votos'), v = h.getDataRange().getValues(), limite = Date.now() - 90 * 864e5;
  for (var i = 1; i < v.length; i++) if (v[i][0] instanceof Date && v[i][0].getTime() < limite && v[i][4]) h.getRange(i + 1, 5).setValue('');
}
