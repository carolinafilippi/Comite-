import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { content, OPTION_KEYS, type OptionKey } from '../../content'
import { api, deviceToken, SESION, useEstadoSala } from '../../lib/api'
import { MobileShell, mEase, PrimaryButton, StateScreen } from './Shell'

const KEY = `awa-a1-${SESION}`
const readDone = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }

/** Actividad 01 — formulario individual y anónimo: los 6 casos, uno tras otro, a ritmo propio. */
export function Votar() {
  const { data, online, refresh } = useEstadoSala()
  const est = data.estado
  const open = est.fase === 'a1' && est.abierta
  const cases = content.cases
  const [done, setDone] = useState(readDone)
  const [selected, setSelected] = useState<OptionKey | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const idx = cases.findIndex(c => !done[c.id])
  const caso = idx >= 0 ? cases[idx] : null
  const answered = cases.length - (idx >= 0 ? cases.filter(c => !done[c.id]).length : 0)

  const mark = (id: string, v: string) => {
    const next = { ...readDone(), [id]: v }
    localStorage.setItem(KEY, JSON.stringify(next)); setDone(next); setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    if (!caso || !selected) return
    setBusy(true); setError('')
    try {
      const r = await api.post({ accion: 'votar', caso: caso.id, opcion: selected, token: deviceToken() })
      if (r.ok || r.error === 'duplicado') { mark(caso.id, selected); navigator.vibrate?.(20) }
      else if (r.error === 'cerrada') { setError('El formulario ya se cerró.'); refresh() }
      else setError('No se pudo registrar. Probá de nuevo.')
    } catch { setError('Sin conexión. Probá de nuevo en unos segundos; tu elección no se perdió.') }
    setBusy(false)
  }

  const view = !caso ? 'done' : open ? 'form' : est.fase === 'a1' || answered > 0 ? 'closed' : 'waiting'

  return (
    <MobileShell online={online} right={caso && open ? `Caso ${idx + 1} de ${cases.length}` : 'Actividad 01'}>
      {view === 'form' && (
        <div className="px-5 -mt-1 mb-4" aria-hidden>
          <div className="h-1.5 rounded-full bg-lilac-50 overflow-hidden">
            <motion.div className="h-full bg-display rounded-full" animate={{ width: `${(answered / cases.length) * 100}%` }} transition={{ duration: 0.5, ease: mEase }} />
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === 'form' && caso && (
          <motion.main key={caso.id} className="flex-1 flex flex-col px-5 pb-32" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: mEase }}>
            <p className="eyebrow text-[12px] text-brand">Caso {caso.number} · {caso.area}</p>
            <h1 className="font-display font-bold text-[23px] leading-[1.15] text-ink mt-2">{caso.title}</h1>
            <p className="mt-3 text-[15px] leading-[1.55] text-text">{caso.context.join(' ')}</p>
            <p className="mt-3 text-[15px] leading-[1.5] text-ink font-medium border-l-[3px] border-display pl-3">“{caso.quote}”</p>
            <p className="mt-6 mb-3 text-[14px] text-muted">¿Qué harías vos? Elegí la que realmente tomarías.</p>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Alternativas</legend>
              {OPTION_KEYS.map(k => {
                const active = selected === k
                return (
                  <motion.label key={k} whileTap={{ scale: 0.98 }} className={`flex gap-4 items-start rounded-2xl p-4 border-2 cursor-pointer transition-colors ${active ? 'border-display bg-lilac-50' : 'border-line bg-white'}`}>
                    <input type="radio" name={`opt-${caso.id}`} value={k} checked={active} onChange={() => setSelected(k)} className="sr-only" />
                    <span className={`shrink-0 size-10 rounded-full grid place-items-center font-display font-bold text-[18px] transition-colors ${active ? 'bg-display text-white' : 'bg-lilac-50 text-display'}`}>{k}</span>
                    <span className="text-[15px] leading-[1.45] text-text pt-1.5">{caso.options[k]}</span>
                  </motion.label>
                )
              })}
            </fieldset>
            {error && <p role="alert" className="mt-4 text-[14px] text-ink bg-mist rounded-xl px-4 py-3">{error}</p>}
            <PrimaryButton onClick={submit} disabled={!selected} busy={busy}>
              {!selected ? 'Elegí una opción' : idx === cases.length - 1 ? 'Enviar y terminar' : 'Responder y seguir →'}
            </PrimaryButton>
          </motion.main>
        )}
        {view === 'done' && <StateScreen key="done" icon="check" title="¡Listo, gracias!" body={`Respondiste los ${cases.length} casos. Mirá la pantalla: los resultados se arman en vivo.`} foot="Tus respuestas son anónimas: no se guarda tu nombre ni datos de tu dispositivo." />}
        {view === 'closed' && <StateScreen key="closed" icon="lock" title="Formulario cerrado" body={answered ? `Llegaste a responder ${answered} de ${cases.length} casos. ¡Gracias!` : 'Este formulario ya no recibe respuestas.'} />}
        {view === 'waiting' && <StateScreen key="wait" icon="dots" title="Ya estás adentro" body="Cuando se abra el formulario, los casos aparecen acá automáticamente. No hace falta recargar." foot="Participación anónima." />}
      </AnimatePresence>
    </MobileShell>
  )
}
