import { useState } from 'react'
import { Logo } from '../components/Brand'
import { SESION } from '../lib/api'

function nueva(prefijo: string) {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${prefijo}-${p(d.getDate())}${p(d.getMonth() + 1)}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

/** Control administrativo: reinicia los formularios empezando una sesión nueva (las respuestas anteriores quedan guardadas en la planilla). */
export function Admin() {
  const [actual, setActual] = useState(SESION)
  const [msg, setMsg] = useState('')
  const usar = (s: string, texto: string) => {
    try { localStorage.setItem('awa-sesion', s) } catch { /* nada */ }
    setActual(s); setMsg(texto)
  }
  const base = location.pathname
  return (
    <main className="min-h-dvh grid place-items-center p-8 bg-mist">
      <div className="max-w-xl w-full bg-white rounded-[28px] p-10 neon-soft">
        <Logo variant="stacked" height={44} />
        <p className="eyebrow text-[13px] text-brand mt-8">Control del Comité</p>
        <h1 className="font-display font-bold text-3xl text-ink mt-2">Formularios</h1>
        <p className="text-muted mt-3">Sesión activa en esta compu:</p>
        <p className="font-display font-semibold text-xl text-display mt-1 break-all">{actual}</p>

        <div className="mt-8 grid gap-3">
          <button className="rounded-full bg-display text-white neon font-display font-semibold text-lg px-6 py-4"
            onClick={() => { if (window.confirm('¿Reiniciar los formularios? Los gráficos y respuestas de la presentación vuelven a cero. Lo anterior queda guardado en la planilla.')) usar(nueva('COMITE'), 'Listo: formularios reiniciados. Abrí la presentación y que vuelvan a escanear los QR.') }}>
            Reiniciar formularios (empezar de cero)
          </button>
          <button className="rounded-full bg-lilac-50 text-display font-display font-semibold text-lg px-6 py-4"
            onClick={() => usar(nueva('PRUEBA'), 'Modo prueba activado: lo que respondas ahora no se mezcla con el evento.')}>
            Hacer una prueba
          </button>
        </div>
        {msg && <p className="mt-5 rounded-2xl bg-mist px-5 py-4 text-ink">{msg}</p>}
        <a className="mt-8 inline-block text-display underline text-lg" href={`${base}?r=${Date.now()}#/presentacion`}>Abrir la presentación →</a>
        <p className="text-subtle text-sm mt-6">Hacelo en la misma compu que proyecta. Los celulares que ya tenían el formulario abierto tienen que volver a escanear el QR.</p>
      </div>
    </main>
  )
}
