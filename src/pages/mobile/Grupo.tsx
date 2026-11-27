import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { content, OPTION_KEYS, type RoleCard } from '../../content'
import { api, SESION, useEstadoSala } from '../../lib/api'
import { MobileShell, mEase, PrimaryButton, StateScreen } from './Shell'

/** Página de grupo: un celular por grupo. Muestra la actividad que esté activa en la presentación. */
export function Grupo() {
  const g = Number(useParams().n)
  const { data, online } = useEstadoSala()
  const fase = data.estado.fase
  // si el administrador reinicia el formulario de este grupo, se vacía solo
  const ep = data.estado.resets?.[`g${g}`] ?? 0
  DRAFT_EPOCH = ep

  useEffect(() => { if (g >= 1 && g <= 6) api.post({ accion: 'grupo_unirse', grupo: g }).catch(() => {}) }, [g])

  if (!(g >= 1 && g <= 6)) return <MobileShell><StateScreen icon="lock" title="Grupo no válido" body="Escaneá el QR de tu grupo en la pantalla." /></MobileShell>
  const label = `Grupo ${String(g).padStart(2, '0')}`

  return (
    <MobileShell online={online} right={label}>
      <AnimatePresence mode="wait">
        {fase === 'a3' ? <Roleplay key={`a3-${ep}`} g={g} />
          : fase === 'compromiso' ? <Compromiso key={`c-${ep}`} g={g} />
            : <Interpretacion key={`a2-${ep}`} g={g} />}
      </AnimatePresence>
    </MobileShell>
  )
}

/* ── Borrador persistente (por si se recarga o se corta la conexión) ── */
let DRAFT_EPOCH = 0
function useDraft<T>(key: string, initial: T) {
  const k = `awa-draft-${SESION}-${DRAFT_EPOCH}-${key}`
  const [v, setV] = useState<T>(() => { try { return { ...initial, ...JSON.parse(localStorage.getItem(k) || '{}') } } catch { return initial } })
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v])
  return [v, setV] as const
}

function useSend() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const send = async (body: Record<string, unknown>) => {
    setBusy(true); setError('')
    try { const r = await api.post(body); if (!r.ok) throw new Error(r.error); setBusy(false); return true }
    catch { setError('No se pudo enviar. Revisá la conexión y probá de nuevo; lo que escribieron no se pierde.'); setBusy(false); return false }
  }
  return { busy, error, send }
}

const Field = ({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) => (
  <label className="block">
    <span className="block text-[14px] font-medium text-ink mb-1.5">{label}</span>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} maxLength={1200} placeholder={placeholder}
      className="w-full rounded-2xl border-2 border-line focus:border-display outline-none px-4 py-3 text-[15px] leading-[1.45] text-ink resize-none bg-white" />
  </label>
)

/* ───────── Actividad 02: interpretar al cliente (opciones) ───────── */
function Interpretacion({ g }: { g: number }) {
  const meta = content.groupsA2.find(x => x.group === g)!
  const [d, setD] = useDraft(`a2o-${g}`, { siente: '', busca: '', primera: '', enviado: false })
  const { busy, error, send } = useSend()
  const ready = meta.questions.every(q => (d as Record<string, unknown>)[q.id])

  if (d.enviado) return (
    <div className="flex-1 flex flex-col">
      <StateScreen icon="check" title="Interpretación enviada" body="Ya aparece en la pantalla. Prepárense para justificar por qué eligieron cada opción." />
      <button onClick={() => setD(x => ({ ...x, enviado: false }))} className="mx-auto mb-10 text-[15px] text-display underline">Cambiar y reenviar</button>
    </div>
  )

  return (
    <motion.main className="flex-1 px-5 pb-32" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: mEase }}>
      <p className="eyebrow text-[12px] text-brand">Actividad 02 · {meta.theme}</p>
      <h1 className="font-display font-bold text-[20px] leading-[1.2] text-ink mt-2">El cliente dice:</h1>
      <p className="mt-2 font-display font-medium text-[18px] leading-[1.35] text-display">“{meta.quote}”</p>
      <p className="mt-3 text-[13px] text-muted">Debatan en grupo y elijan una opción en cada pregunta.</p>
      <div className="mt-6 flex flex-col gap-7">
        {meta.questions.map((q, qi) => (
          <fieldset key={q.id}>
            <legend className="font-display font-semibold text-[16px] text-ink mb-3">{qi + 1}. {q.prompt}</legend>
            <div className="flex flex-col gap-2.5">
              {OPTION_KEYS.map(k => {
                const on = (d as Record<string, unknown>)[q.id] === k
                return (
                  <motion.label key={k} whileTap={{ scale: 0.98 }} className={`flex gap-3 items-start rounded-2xl p-3.5 border-2 cursor-pointer transition-colors ${on ? 'border-display bg-lilac-50' : 'border-line bg-white'}`}>
                    <input type="radio" name={`${g}-${q.id}`} value={k} checked={on} onChange={() => setD(x => ({ ...x, [q.id]: k }))} className="sr-only" />
                    <span className={`shrink-0 size-9 rounded-full grid place-items-center font-display font-bold text-[16px] transition-colors ${on ? 'bg-display text-white' : 'bg-lilac-50 text-display'}`}>{k}</span>
                    <span className="text-[14.5px] leading-[1.45] text-text pt-1">{q.options[k]}</span>
                  </motion.label>
                )
              })}
            </div>
          </fieldset>
        ))}
        {error && <p role="alert" className="text-[14px] text-ink bg-mist rounded-xl px-4 py-3">{error}</p>}
      </div>
      <PrimaryButton busy={busy} disabled={!ready} onClick={async () => {
        if (await send({ accion: 'interpretacion', grupo: g, siente: d.siente, busca: d.busca, primera: d.primera })) setD(x => ({ ...x, enviado: true }))
      }}>{ready ? 'Enviar interpretación' : 'Elijan una opción en cada pregunta'}</PrimaryButton>
    </motion.main>
  )
}

/* ───────── Actividad 03: roleplay ───────── */
function Roleplay({ g }: { g: number }) {
  const c = content.roleplay.cases.find(x => x.group === g)!
  const ev = content.roleplay.evaluation
  const [step, setStep] = useDraft(`a3s-${g}`, { s: 'cards' as 'cards' | 'eval' | 'done' })
  const [d, setD] = useDraft(`a3-${g}`, { comprension: 0, fundamento: 0, limites: 0, solucion: 0, acuerdo: 0, frase: '' })
  const { busy, error, send } = useSend()
  const ready = ev.every(e => (d as Record<string, unknown>)[e.id])

  if (step.s === 'done') return (
    <div className="flex-1 flex flex-col">
      <StateScreen icon="check" title="Evaluación enviada" body="Gracias. Es una autoevaluación del ejercicio, no una medición de desempeño." />
      <button onClick={() => setStep({ s: 'eval' })} className="mx-auto mb-10 text-[15px] text-display underline">Editar y reenviar</button>
    </div>
  )

  return (
    <motion.main className="flex-1 px-5 pb-32" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: mEase }}>
      <p className="eyebrow text-[12px] text-brand">Actividad 03 · Roleplay</p>
      <h1 className="font-display font-bold text-[24px] leading-[1.15] text-ink mt-2">{c.title}</h1>
      <p className="mt-2 text-[15px] leading-[1.5] text-text">{c.summary}</p>
      <p className="mt-1 text-[13px] text-muted">Profesional de Avalon: {c.professional}</p>

      {step.s === 'cards' ? (
        <>
          <ol className="mt-5 text-[14px] leading-[1.5] text-text list-decimal pl-5 space-y-1">
            <li>Asignen roles: cliente, profesional y observadores.</li>
            <li>Cada rol lee <b>solo su tarjeta</b>, a solas.</li>
            <li>Conversen unos 8 minutos. Después, evalúen en grupo.</li>
          </ol>
          <div className="mt-5 flex flex-col gap-4">
            <HoldCard title="Tarjeta del cliente" tone="client" card={c.client} />
            <HoldCard title="Tarjeta del profesional" tone="pro" card={c.pro} />
          </div>
          <PrimaryButton onClick={() => setStep({ s: 'eval' })}>Terminamos la conversación · Evaluar</PrimaryButton>
        </>
      ) : (
        <>
          <p className="mt-6 text-[14px] text-muted">Evaluación del grupo, de 1 (nada) a 5 (totalmente).</p>
          <div className="mt-4 flex flex-col gap-5">
            {ev.map(e => (
              <div key={e.id}>
                <p className="text-[15px] font-medium text-ink mb-2">{e.label}</p>
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={e.label}>
                  {[1, 2, 3, 4, 5].map(n => {
                    const on = (d as Record<string, unknown>)[e.id] === n
                    return <button key={n} role="radio" aria-checked={on} onClick={() => setD(x => ({ ...x, [e.id]: n }))}
                      className={`h-12 rounded-xl font-display font-semibold text-[17px] border-2 transition-colors ${on ? 'bg-display border-display text-white' : 'border-line text-ink'}`}>{n}</button>
                  })}
                </div>
              </div>
            ))}
            <Field label={content.roleplay.phraseQuestion} value={d.frase} onChange={v => setD(x => ({ ...x, frase: v }))} />
            {error && <p role="alert" className="text-[14px] text-ink bg-mist rounded-xl px-4 py-3">{error}</p>}
            <button onClick={() => setStep({ s: 'cards' })} className="text-[14px] text-display underline self-start">Volver a las tarjetas</button>
          </div>
          <PrimaryButton busy={busy} disabled={!ready} onClick={async () => { if (await send({ accion: 'roleplay', grupo: g, ...d })) setStep({ s: 'done' }) }}>
            {ready ? 'Enviar evaluación' : 'Completen las cinco preguntas'}
          </PrimaryButton>
        </>
      )}
    </motion.main>
  )
}

/** Tarjeta privada: se ve solo mientras se mantiene apretada. */
function HoldCard({ title, card, tone }: { title: string; card: RoleCard; tone: 'client' | 'pro' }) {
  const [show, setShow] = useState(false)
  const on = () => { setShow(true); navigator.vibrate?.(15) }
  const off = () => setShow(false)
  return (
    <div className={`relative rounded-3xl overflow-hidden select-none touch-none ${tone === 'pro' ? 'bg-display text-white' : 'bg-graphite text-white'}`}
      onPointerDown={on} onPointerUp={off} onPointerLeave={off} onPointerCancel={off} onContextMenu={e => e.preventDefault()}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <div className={`p-5 transition-[filter,opacity] duration-150 ${show ? '' : 'blur-md opacity-30'}`} aria-hidden={!show}>
        <p className="eyebrow text-[11px] opacity-70">{title}</p>
        <Sec t="Contexto" v={card.context} />
        <Sec t="Tu objetivo" v={card.goal} />
        {card.hidden && <Sec t="Lo que no decís de entrada" v={card.hidden} strong />}
        {card.behaviour && <Sec t="Cómo actuar" v={card.behaviour} />}
        {card.keys && <div className="mt-3"><p className="text-[11px] uppercase tracking-[.1em] opacity-70 font-display">Claves</p><ul className="text-[14px] leading-[1.45] mt-1 space-y-1">{card.keys.map(k => <li key={k}>· {k}</li>)}</ul></div>}
        <div className="mt-3"><p className="text-[11px] uppercase tracking-[.1em] opacity-70 font-display">Frases posibles (no es un guion)</p><ul className="text-[14px] leading-[1.45] mt-1 space-y-1 italic">{card.lines.map(k => <li key={k}>“{k}”</li>)}</ul></div>
      </div>
      {!show && (
        <div className="absolute inset-0 grid place-items-center text-center px-6">
          <div>
            <p className="font-display font-bold text-[20px]">{title}</p>
            <p className="text-[14px] opacity-80 mt-2">Mantené apretado para leer · soltá para ocultar</p>
          </div>
        </div>
      )}
    </div>
  )
}
const Sec = ({ t, v, strong }: { t: string; v: string; strong?: boolean }) => (
  <div className="mt-3"><p className="text-[11px] uppercase tracking-[.1em] opacity-70 font-display">{t}</p><p className={`text-[14px] leading-[1.45] mt-0.5 ${strong ? 'font-semibold' : ''}`}>{v}</p></div>
)

/* ───────── Compromiso ───────── */
function Compromiso({ g }: { g: number }) {
  const [d, setD] = useDraft(`comp-${g}`, { regla: '', enviado: false })
  const { busy, error, send } = useSend()
  if (d.enviado) return (
    <div className="flex-1 flex flex-col">
      <StateScreen icon="check" title="Regla enviada" body="Va a formar parte del futuro Manual de Conversaciones con Clientes." />
      <button onClick={() => setD(x => ({ ...x, enviado: false }))} className="mx-auto mb-10 text-[15px] text-display underline">Editar y reenviar</button>
    </div>
  )
  return (
    <motion.main className="flex-1 px-5 pb-32" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: mEase }}>
      <p className="eyebrow text-[12px] text-brand">Compromiso final</p>
      <h1 className="font-display font-bold text-[22px] leading-[1.2] text-ink mt-2">¿Qué regla de comunicación debería incorporar Avalon?</h1>
      <p className="mt-2 text-[14px] text-muted">Una frase concreta, que cualquiera del equipo pueda aplicar en su próxima conversación con un cliente.</p>
      <div className="mt-5"><Field label="Nuestra regla" value={d.regla} onChange={v => setD(x => ({ ...x, regla: v }))} rows={4} /></div>
      {error && <p role="alert" className="mt-4 text-[14px] text-ink bg-mist rounded-xl px-4 py-3">{error}</p>}
      <PrimaryButton busy={busy} disabled={d.regla.trim().length < 5} onClick={async () => { if (await send({ accion: 'compromiso', grupo: g, regla: d.regla })) setD(x => ({ ...x, enviado: true })) }}>Enviar regla</PrimaryButton>
    </motion.main>
  )
}
