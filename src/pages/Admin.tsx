import { useEffect, useMemo, useRef, useState } from 'react'
import { Logo } from '../components/Brand'
import { content } from '../content'
import { api, SESION, useControl, useResultados } from '../lib/api'
import { buildScreens } from '../lib/deck'

/** Control administrativo: control remoto de la presentación + reinicio de cada formulario.
 *  Funciona desde cualquier dispositivo (celular, otra compu). Las respuestas reiniciadas
 *  no se borran: quedan guardadas en la planilla. */
export function Admin() {
  const screens = useMemo(buildScreens, [])
  const ctrl = useControl().data.control
  const res = useResultados().data
  const [pos, setPos] = useState({ i: 0, step: 0 })
  const [msg, setMsg] = useState('')
  const lastSent = useRef(0)

  // sigue a la presentación (salvo justo después de que el admin mandó una orden)
  useEffect(() => {
    if (!ctrl) return
    if (Date.now() - lastSent.current < 1500 && ctrl.origen === 'deck') return
    setPos({ i: ctrl.i, step: ctrl.step })
  }, [ctrl])

  const send = (p: { i: number; step: number }) => {
    const i = Math.max(0, Math.min(screens.length - 1, p.i))
    const step = Math.max(0, Math.min(screens[i].steps, p.step))
    setPos({ i, step }); lastSent.current = Date.now()
    api.post({ accion: 'control', i, step, origen: 'admin' }).catch(() => setMsg('Sin conexión: no se pudo mover la presentación'))
  }
  const next = () => send(pos.step < screens[pos.i].steps ? { i: pos.i, step: pos.step + 1 } : { i: pos.i + 1, step: 0 })
  const prev = () => send(pos.step > 0 ? { i: pos.i, step: pos.step - 1 } : { i: pos.i - 1, step: pos.i > 0 ? screens[pos.i - 1].steps : 0 })

  const reiniciar = async (que: string, nombre: string) => {
    if (!window.confirm(`¿Reiniciar ${nombre}? Lo que se ve en la presentación vuelve a cero. Las respuestas anteriores quedan guardadas en la planilla.`)) return
    setMsg('Reiniciando…')
    try { const r = await api.post({ accion: 'reiniciar', que }); setMsg(r.ok ? `Listo: ${nombre} reiniciado.` : 'No se pudo reiniciar. ¿Actualizaste el código de Apps Script?') }
    catch { setMsg('Sin conexión: no se pudo reiniciar') }
  }

  const votos = Object.values(res.votos ?? {}).reduce((a, t) => a + t.A + t.B + t.C + t.D, 0)
  const respondio = (g: number) => !!res.interpretaciones?.[g]
  const cur = screens[Math.min(pos.i, screens.length - 1)]

  return (
    <main className="min-h-dvh bg-mist p-5 sm:p-8">
      <div className="max-w-2xl mx-auto grid gap-5">
        <div className="flex items-center justify-between">
          <Logo variant="stacked" height={36} />
          <span className="text-xs text-muted font-display">Sesión {SESION}</span>
        </div>

        <section className="bg-white rounded-[28px] p-6 neon-soft">
          <p className="eyebrow text-[12px] text-brand">Control remoto</p>
          <p className="text-muted text-sm mt-3">Slide {pos.i + 1} de {screens.length}{cur.steps ? ` · paso ${pos.step}/${cur.steps}` : ''}</p>
          <p className="font-display font-bold text-xl text-ink mt-1 line-clamp-2 min-h-[56px]">{cur.title}</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={prev} className="rounded-2xl bg-lilac-50 text-display font-display font-bold text-2xl py-6 active:scale-[.98]">◀ Anterior</button>
            <button onClick={next} className="rounded-2xl bg-display text-white neon font-display font-bold text-2xl py-6 active:scale-[.98]">Siguiente ▶</button>
          </div>
          <select className="mt-4 w-full rounded-xl border border-line px-4 py-3 text-base bg-white" value={pos.i} onChange={e => send({ i: Number(e.target.value), step: 0 })}>
            {screens.map((s, i) => <option key={s.key} value={i}>{i + 1}. {s.title}</option>)}
          </select>
        </section>

        <section className="bg-white rounded-[28px] p-6 neon-soft">
          <p className="eyebrow text-[12px] text-brand">Formulario 1 · Actividad individual</p>
          <p className="text-ink mt-2"><b className="font-display">{votos}</b> respuestas recibidas</p>
          <button onClick={() => reiniciar('a1', 'el formulario 1')} className="mt-4 w-full rounded-full bg-display text-white neon font-display font-semibold text-lg py-4">Reiniciar formulario 1</button>
        </section>

        <section className="bg-white rounded-[28px] p-6 neon-soft">
          <p className="eyebrow text-[12px] text-brand">Formularios de grupo · Actividad 02</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {content.groupsA2.map(g => (
              <button key={g.group} onClick={() => reiniciar(`g${g.group}`, `el formulario del grupo ${g.group}`)}
                className="rounded-2xl border-2 border-line px-4 py-3 text-left active:scale-[.98]">
                <span className="font-display font-bold text-lg text-ink">Grupo {String(g.group).padStart(2, '0')}</span>
                <span className={`block text-sm ${respondio(g.group) ? 'text-sym-green' : 'text-subtle'}`}>{respondio(g.group) ? '● respondió' : '○ sin respuesta'}</span>
                <span className="block text-sm text-display underline mt-1">Reiniciar</span>
              </button>
            ))}
          </div>
          <button onClick={() => reiniciar('grupos', 'todos los formularios de grupo')} className="mt-4 w-full rounded-full bg-lilac-50 text-display font-display font-semibold text-lg py-4">Reiniciar todos los grupos</button>
        </section>

        {msg && <p className="rounded-2xl bg-white px-5 py-4 text-ink neon-soft">{msg}</p>}
        <p className="text-subtle text-xs text-center">Abrí esta página en el celular o en otra compu. La presentación sigue tus órdenes sola, sin recargar.</p>
      </div>
    </main>
  )
}
