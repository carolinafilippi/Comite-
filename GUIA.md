# Comité Avalon — "Lo que el cliente no dice"

Una presentación web con formularios propios de Avalon. Las respuestas se guardan en una planilla de Google que nadie ve en la sala. No hay panel ni servidor que mantener.

**Qué hay en este paquete**

- `sitio/`: la presentación lista para publicar.
- `google/Codigo.gs`: el script que conecta la planilla.
- `codigo-fuente/`: el proyecto completo (React + Vite) por si hay que modificar el diseño.
- Los textos de todas las diapositivas están en `codigo-fuente/src/content/comite.json`.

---

## 1. Instalación (una sola vez, unos 15 minutos)

### A. La planilla y el script

1. Creá una planilla nueva en Google Sheets con la cuenta de Avalon. Por ejemplo: *Comité · Lo que el cliente no dice*.
2. Abrí **Extensiones → Apps Script**. Borrá lo que aparece y pegá todo el contenido de `google/Codigo.gs`. Guardá.
3. Andá a **Configuración del proyecto (ícono ⚙) → Propiedades del script** y agregá dos propiedades:
   - `CLAVE_PRESENTADOR` → una clave larga e inventada, por ejemplo `gerson-7kq2-mx91-comite`. Solo la usa la compu de Gerson.
   - `SAL` → otro texto largo y aleatorio. Sirve para anonimizar los votos.
4. Volvé al editor, elegí la función `prepararPlanilla` y tocá **Ejecutar**. Google va a pedir permisos: aceptalos. Se crean 4 hojas: votos, interpretaciones, roleplay y compromisos.
5. Tocá **Implementar → Nueva implementación → Tipo: Aplicación web** y configurala así:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona**. Es necesario para que voten celulares sin cuenta de Google.
   - Copiá la URL que termina en `/exec`.

### B. Publicar la presentación

1. Abrí `sitio/config.js` con cualquier editor de texto y completalo:
   ```js
   apiUrl: "https://script.google.com/macros/s/XXXX/exec",   // la URL del paso 5
   sesion: "COMITE-EVENTO",
   siteUrl: ""                                               // completalo después del paso 2
   ```
2. Entrá a **app.netlify.com/drop** (con una cuenta gratuita) y arrastrá la carpeta `sitio` completa. Netlify te da una dirección del tipo `https://nombre.netlify.app`. Podés cambiar el nombre en *Site settings*.
3. Copiá esa dirección en `siteUrl` dentro de `config.js` y volvé a arrastrar la carpeta. Así los QR apuntan siempre a la dirección pública.

Si alguna vez cambiás el script, usá **Implementar → Administrar implementaciones → Editar → Nueva versión**. Así la URL `/exec` sigue siendo la misma.

---

## 2. Direcciones

| Para qué | Dirección |
|---|---|
| Presentación (la primera vez, con la clave) | `https://TU-SITIO/#/presentacion?k=TU_CLAVE` |
| Presentación (las siguientes veces) | `https://TU-SITIO/#/presentacion` (la compu recuerda la clave) |
| Notas del presentador | Tecla **N** desde la presentación |
| Celulares, votación individual | La abren con el QR |
| Celulares de grupo | La abren con su QR (Grupo 01 a 06) |
| Ensayo sin tocar los datos reales | Agregá `?sesion=PRUEBA` a la dirección |
| Demo sin planilla (votos simulados) | Agregá `?demo` a la dirección |

**Nunca proyectes ni compartas la dirección que tiene `?k=`.** Es la que permite abrir y cerrar votaciones.

---

## 3. Guía rápida para Gerson

**Teclado**

| Tecla | Acción |
|---|---|
| → / Espacio | Avanzar. En las diapositivas con revelado, muestra el paso siguiente |
| ← | Volver |
| F | Pantalla completa |
| O | Vista general para saltar a cualquier capítulo |
| N | Abre la ventana de notas: próxima diapositiva, tiempos, estado de la sala y botones |
| V | Abrir o cerrar el formulario de la Actividad 01 |
| H | Ocultar o mostrar resultados mientras explicás |
| T | Iniciar o pausar el temporizador de la actividad |
| + / − | Sumar o restar un minuto |
| 1 a 6 | Abrir la respuesta de un grupo (Actividad 02) o una frase (Actividad 03). Esc la cierra |
| M | Sonido sutil de votos y fin de tiempo (viene apagado) |

**Cómo fluye cada actividad**

- **Actividad 01.** En la diapositiva del QR, el formulario se abre solo. Cada persona escanea y responde los 6 casos a su ritmo, uno tras otro desde el celular. En la diapositiva aparece cuántos están respondiendo y cuántos terminaron, y T inicia los 10 minutos. La diapositiva siguiente muestra los gráficos de los 6 casos, que se actualizan solos. Con las teclas 1 a 6 ampliás un caso para debatirlo. La recomendación y la pregunta de debate de ese caso aparecen solo en la ventana de notas (N), nunca en la pantalla. El formulario se cierra solo al pasar al bloque 02. V lo abre o lo cierra a mano.
- **Actividad 02.** Diapositiva 20 ("Escaneen y respondan"): cada grupo escanea su QR y elige en el celular una opción por pregunta (qué siente el cliente, qué busca, qué haría primero). La tarjeta del grupo pasa a "Respondió"; T inicia los 8 minutos. Diapositiva 21: cada grupo ve su interpretación, calculada a partir de sus respuestas (por ejemplo, A·D·B = "Creatividad"). Con → aparece la necesidad real de cada cliente (por ejemplo, "Resultados"): verde si coincide, violeta si no. Teclas 1 a 6: detalle del grupo. Diapositiva 22: el análisis de los 6 casos en una sola pantalla (lo que parecía vs. lo que necesitaba cada cliente).
  - Cómo se calcula: en `contenido.json`, cada opción tiene una etiqueta (`tags`) con la necesidad a la que apunta, y cada caso tiene su necesidad real (`need`). Gana la necesidad más repetida entre las 3 respuestas; si empatan, decide la respuesta a "¿Qué está buscando realmente?".
- **Actividad 03.** Diapositiva 30 ("Actividad 03 · Roleplay"): explica la dinámica en 4 pasos y muestra el estado de cada grupo. Los grupos usan el mismo QR: el celular muestra el caso y dos tarjetas privadas (se leen manteniendo el dedo apretado) y después la evaluación. T inicia los 8 minutos. En los resultados se ve el promedio de las 5 habilidades y las frases destacadas; nunca puntajes individuales.
- **Compromiso.** Cada grupo envía una regla y aparece en vivo en la pantalla.

**Si algo falla**

- Si se corta internet, la pantalla muestra "Reconectando…" y sigue sola cuando vuelve la conexión. Los grupos no pierden lo que escribieron.
- Si se recarga la presentación, vuelve a la misma diapositiva.
- Si un celular se recarga, vuelve al caso abierto y recuerda que ya votó.

---

## 4. Prueba previa al evento (el día anterior)

1. Abrí `TU-SITIO/#/presentacion?sesion=PRUEBA&k=TU_CLAVE` en la compu y conectala al proyector.
2. Con 2 o 3 celulares reales, escaneá el QR de la Actividad 01 y respondé los 6 casos. Avanzá a la diapositiva de gráficos y verificá que las barras suben en 3 o 4 segundos.
3. Recargá un celular a mitad del formulario: tiene que seguir desde el caso donde quedó, sin repetir los ya respondidos.
4. Pasá al bloque 02 y verificá que el celular muestre "Formulario cerrado".
5. Escaneá el QR de un grupo, elegí las opciones de la Actividad 02 y una evaluación del roleplay, y revisá que aparezcan en la pantalla.
6. Cortá el wifi de un celular, volvé a conectarlo y verificá que sigue funcionando.
7. Al terminar: Apps Script → ejecutar `borrarSesionDePrueba`. Esa función borra solo los datos de PRUEBA y nunca toca los del Comité.
8. El día del evento abrí `TU-SITIO/#/presentacion` **sin** `?sesion=PRUEBA`.

---

## 5. Después del Comité

- **Resultados:** están en la planilla. Para descargarlos, andá a Archivo → Descargar → CSV o Excel.
- **Privacidad:** no se guardan nombres, emails, IP ni datos del dispositivo. Cada celular genera un número aleatorio y la planilla guarda solo un código derivado (hash) para evitar votos dobles. Los grupos se guardan por número.
- **Límite del voto único:** como no hay login, alguien que abra otro navegador o una ventana de incógnito puede votar de nuevo. Para un Comité interno es un riesgo aceptable. Pedir login rompería el anonimato.
- **Retención:** pasados 90 días, ejecutá `aplicarRetencion` (o programala con un activador mensual). Borra los códigos de voto y conserva solo las respuestas. Si querés borrar todo, eliminá la planilla.

---

## 6. Cambiar textos o datos (sin Claude y sin recompilar)

Todos los textos están en **`docs/contenido.json`**, en el repositorio de GitHub: diapositivas, casos, alternativas, respuestas correctas y análisis de la Actividad 02, autores, roleplay, notas del presentador y duraciones.

1. Abrí el archivo en github.com/carolinafilippi/Comite-/blob/main/docs/contenido.json y tocá el lápiz (Edit).
2. Cambiá el texto entre comillas. No borres comillas, comas ni llaves.
3. Tocá **Commit changes**. En 1 o 2 minutos el cambio aparece en la presentación y en los celulares. Recargá la página.

Si el archivo queda con un error de formato, la presentación sigue funcionando con los textos anteriores. Para verificar antes de guardar, podés pegar el contenido en jsonlint.com.

- **Encuesta de sentimiento:** completá `sentimentSurvey` con los datos reales y poné `"loaded": true`. Mientras no haya datos, la diapositiva muestra "Datos pendientes de incorporar".
- **"Lo que creemos vs. lo que perciben":** cargá los pares en `beliefsVsPerception.items`, cada uno marcado como `"hecho"` o `"interpretacion"`.

Los cambios de diseño o de funcionamiento sí requieren modificar el código (`src/`) y volver a compilar.

## 7. Empezar de cero

Las respuestas se separan por **sesión**. En `docs/config.js`, el valor `sesion` define la sesión del evento real. Si ese día querés que todo arranque en cero, cambiá ese nombre (por ejemplo `"COMITE-DIC"`). Las respuestas viejas quedan en la planilla, pero la presentación no las muestra.
