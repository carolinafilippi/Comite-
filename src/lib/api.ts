/**
 * Capa de datos. Dos modos:
 *  - REAL: Google Apps Script + Google Sheets (config.js → apiUrl).
 *  - DEMO: sin apiUrl o con ?demo en la URL. Todo queda en este navegador y se etiqueta
 *          en pantalla como datos simulados. Nunca escribe en la planilla real.
 */
import { useEffect, useRef, useState } from 'react'
import type { OptionKey } from '../content'

declare global { interface Window { AVALON_CONFIG?: { apiUrl?: string; sesion?: string; siteUrl?: string } } }

export interface Estado { fase: string; caso: string | null; abierta: boolean; abiertaEn: number; duracion: number }
export interface Interpretacion { siente: OptionKey | ''; busca: OptionKey | ''; primera: OptionKey | '' }
export interface Evaluacion { comprension: number; fundamento: number; limites: number; solucion: number; acuerdo: number; frase: string }
export interface Resultados {
  estado: Estado
  votos: Record<string, Record<OptionKey, number>>
  interpretaciones: Record<string, Interpretacion>
  roleplay: Record<string, Evaluacion>
  compromisos: Record<string, string>
  unidos: number[]
  ahora: number
}

const ESTADO_INICIAL: Estado = { fase: 'espera', caso: null, abierta: false, abiertaEn: 0, duracion: 0 }
const VACIO: Resultados = { estado: ESTADO_INICIAL, votos: {}, interpretaciones: {}, roleplay: {}, compromisos: {}, unidos: [], ahora: Date.now() }

function hashParams() {
  const q = window.location.hash.split('?')[1] ?? ''
  return new URLSearchParams(q || window.location.search)
}
const cfg = window.AVALON_CONFIG ?? {}
const params = hashParams()
export const IS_DEMO = !cfg.apiUrl || params.has('demo')
export const SESION = (params.get('sesion') || cfg.sesion || 'COMITE').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40)
export const IS_TEST_SESSION = SESION !== 'COMITE'

/** URL pública para los QR (respeta demo/sesión de prueba). */
export function publicUrl(route: string) {
  const base = (cfg.siteUrl || window.location.origin + window.location.pathname).replace(/\/$/, '').replace(/\/index\.html$/, '')
  const q = new URLSearchParams()
  if (IS_TEST_SESSION) q.set('sesion', SESION)
  if (IS_DEMO && cfg.apiUrl) q.set('demo', '1')
  const qs = q.toString()
  return `${base}/#${route}${qs ? '?' + qs : ''}`
}

/* ───────────── Token anónimo del dispositivo ───────────── */
export function deviceToken(): string {
  const k = 'awa-token'
  try {
    let t = localStorage.getItem(k)
    if (!t) { t = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().slice(0, 8); localStorage.setItem(k, t) }
    return t
  } catch { return crypto.randomUUID().replace(/-/g, '') }
}

/* ───────────── Modo REAL ───────────── */
async function realGet(accion: string) {
  const r = await fetch(`${cfg.apiUrl}?accion=${accion}&sesion=${SESION}&t=${Date.now()}`, { cache: 'no-store' })
  return r.json()
}
async function realPost(body: Record<string, unknown>) {
  const r = await fetch(cfg.apiUrl!, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...body, sesion: SESION }) })
  return r.json() as Promise<{ ok: boolean; error?: string; estado?: Estado }>
}

/* ───────────── Modo DEMO (localStorage compartido entre pestañas) ───────────── */
const DEMO_KEY = `awa-demo-${SESION}`
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('awa-demo') : null
function demoRead(): Resultados & { tokens: string[] } {
  try { return { ...VACIO, tokens: [], ...JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') } } catch { return { ...VACIO, tokens: [] } }
}
function demoWrite(fn: (d: Resultados & { tokens: string[] }) => void) {
  const d = demoRead(); fn(d); d.ahora = Date.now()
  localStorage.setItem(DEMO_KEY, JSON.stringify(d)); bc?.postMessage('changed')
}
function demoEstado(): Estado {
  const e = demoRead().estado
  if (e.abierta && e.duracion && Date.now() > e.abiertaEn + e.duracion * 1000 + 3000) return { ...e, abierta: false }
  return e
}
async function demoPost(body: Record<string, any>): Promise<{ ok: boolean; error?: string; estado?: Estado }> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const g = String(body.grupo ?? '')
  switch (body.accion) {
    case 'votar': {
      const e = demoEstado()
      if (!e.abierta || e.fase !== 'a1') return { ok: false, error: 'cerrada' }
      const caso = String(body.caso)
      const tk = `${caso}:${body.token}`
      if (demoRead().tokens.includes(tk)) return { ok: false, error: 'duplicado' }
      demoWrite(d => { d.votos[caso] ??= { A: 0, B: 0, C: 0, D: 0 }; d.votos[caso][body.opcion as OptionKey]++; d.tokens.push(tk) })
      return { ok: true }
    }
    case 'grupo_unirse': demoWrite(d => { if (!d.unidos.includes(+g)) d.unidos.push(+g) }); return { ok: true }
    case 'interpretacion': demoWrite(d => { d.interpretaciones[g] = { siente: body.siente, busca: body.busca, primera: body.primera } }); return { ok: true }
    case 'roleplay': demoWrite(d => { d.roleplay[g] = body as Evaluacion }); return { ok: true }
    case 'compromiso': demoWrite(d => { d.compromisos[g] = body.regla }); return { ok: true }
    case 'estado': {
      let est = demoEstado()
      demoWrite(d => {
        est = { ...est }
        if (body.fase !== undefined) est.fase = body.fase
        if (body.caso !== undefined) est.caso = body.caso
        if (body.abierta !== undefined) { est.abierta = !!body.abierta; if (est.abierta) { est.abiertaEn = Date.now(); est.duracion = body.duracion || 1800 } }
        d.estado = est
      })
      return { ok: true, estado: est }
    }
  }
  return { ok: false, error: 'accion' }
}

/** Simulación de participantes y grupos — SOLO modo demo. */
export const demo = {
  votes(caseId: string, n: number) {
    const w: [OptionKey, number][] = [['A', 0.2], ['B', 0.3], ['C', 0.15], ['D', 0.35]]
    demoWrite(d => {
      d.votos[caseId] ??= { A: 0, B: 0, C: 0, D: 0 }
      for (let i = 0; i < n; i++) { let r = Math.random(); for (const [k, p] of w) { if ((r -= p) <= 0) { d.votos[caseId][k]++; break } } }
    })
  },
  groups(kind: 'join' | 'a2' | 'a3' | 'compromiso') {
    demoWrite(d => {
      for (let g = 1; g <= 6; g++) {
        if (!d.unidos.includes(g)) d.unidos.push(g)
        if (kind === 'a2') { const L: OptionKey[] = ['A', 'B', 'C', 'D']; d.interpretaciones[g] = { siente: L[(g * 7) % 4], busca: L[(g * 3 + 1) % 4], primera: L[(g * 5 + 2) % 4] } }
        if (kind === 'a3') d.roleplay[g] = { comprension: 2 + (g % 4), fundamento: 3 + (g % 3), limites: 1 + (g % 5), solucion: 3 + (g % 2), acuerdo: 2 + (g % 3), frase: `[DEMO] Frase simulada del grupo ${g}.` }
        if (kind === 'compromiso') d.compromisos[g] = `[DEMO] Regla simulada del grupo ${g}.`
      }
    })
  },
  reset() { localStorage.removeItem(DEMO_KEY); bc?.postMessage('changed') },
}

/* ───────────── API pública ───────────── */
export const api = {
  post: (body: Record<string, unknown>) => (IS_DEMO ? demoPost(body) : realPost(body)),
  async resultados(): Promise<Resultados> {
    if (IS_DEMO) { const { tokens: _t, ...r } = demoRead(); void _t; return { ...r, estado: demoEstado(), ahora: Date.now() } }
    const r = await realGet('resultados'); if (!r.ok) throw new Error(r.error); return r
  },
  async estado(): Promise<{ estado: Estado; ahora: number }> {
    if (IS_DEMO) return { estado: demoEstado(), ahora: Date.now() }
    const r = await realGet('estado'); if (!r.ok) throw new Error(r.error); return r
  },
}

/** Sondeo periódico con reintento silencioso; expone si hay conexión. */
export function usePoll<T>(fn: () => Promise<T>, ms: number, initial: T) {
  const [data, setData] = useState<T>(initial)
  const [online, setOnline] = useState(true)
  const [offset, setOffset] = useState(0) // reloj del servidor - reloj local
  const tick = useRef(0)
  useEffect(() => {
    let alive = true
    let timer: number
    const run = async () => {
      const my = ++tick.current
      try {
        const d = await fn()
        if (!alive || my !== tick.current) return
        setData(d); setOnline(true)
        const ahora = (d as { ahora?: number }).ahora
        if (ahora) setOffset(ahora - Date.now())
      } catch { if (alive) setOnline(false) }
      if (alive) timer = window.setTimeout(run, document.hidden ? ms * 3 : ms)
    }
    run()
    const onChange = () => { clearTimeout(timer); run() }
    bc?.addEventListener('message', onChange)
    window.addEventListener('online', onChange)
    return () => { alive = false; clearTimeout(timer); bc?.removeEventListener('message', onChange); window.removeEventListener('online', onChange) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const refresh = () => { tick.current++; fn().then(d => { setData(d); setOnline(true) }).catch(() => setOnline(false)) }
  return { data, online, offset, refresh }
}

export const useResultados = () => usePoll(api.resultados, 2500, VACIO)
export const useEstadoSala = () => usePoll(api.estado, 3000, { estado: ESTADO_INICIAL, ahora: Date.now() })

/** Segundos restantes de la votación abierta, según el reloj del servidor. */
export function secondsLeft(e: Estado, offset: number) {
  if (!e.abierta || !e.duracion) return 0
  return Math.max(0, Math.ceil((e.abiertaEn + e.duracion * 1000 - (Date.now() + offset)) / 1000))
}
