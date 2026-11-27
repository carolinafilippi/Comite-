import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { content, OPTION_KEYS, type OptionKey } from '../content'
import { TimerChip } from '../components/TimerChip'
import { dispersion, ease, Eyebrow, Frame, rise, Title } from './kit'
import type { SlideProps } from './types'


/* ───────── Resultados en vivo de los 6 casos ───────── */
export function A1ResultsSlide({ def, page, ctx }: SlideProps) {
  const est = ctx.results.estado
  const open = est.abierta && est.fase === 'a1'
  const totals = content.cases.map(c => { const t = ctx.results.votos[c.id]; return t ? OPTION_KEYS.reduce((a, k) => a + t[k], 0) : 0 })
  const people = Math.max(0, ...totals)
  const sel = ctx.selected && ctx.selected <= content.cases.length ? content.cases[ctx.selected - 1] : null
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px] flex items-end justify-between gap-10">
        <div>
          <Title size={60}>{def.title}</Title>
          <motion.p className="text-[22px] text-text mt-2" {...rise(0.15)}>{ctx.hidden ? 'Resultados ocultos durante la explicación.' : def.lead}</motion.p>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {ctx.timer && <TimerChip t={ctx.timer} />}
          <StatusPill open={open} pulseKey={totals.reduce((a, b) => a + b, 0)} />
          <p className="font-display font-semibold text-[24px] text-ink tabular-nums"><AnimatedNumber value={people} /> <span className="font-normal text-muted">participantes</span></p>
        </div>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[300px] bottom-[96px] grid grid-cols-3 grid-rows-2 gap-6">
        {content.cases.map((c, i) => (
          <motion.div key={c.id} className="rounded-[30px] bg-mist px-8 py-6 flex flex-col" {...rise(0.1 + i * 0.06, 20)}>
            <div className="flex items-baseline justify-between">
              <p className="eyebrow text-[16px] text-brand">Caso {c.number} · {c.area}</p>
              <span className="text-[15px] text-subtle font-display">tecla {i + 1}</span>
            </div>
            <p className="font-display font-bold text-[22px] leading-[1.2] text-ink mt-1.5 line-clamp-2 min-h-[53px]">{c.title}</p>
            <div className="mt-auto flex flex-col gap-2">
              <Bars t={ctx.results.votos[c.id]} hidden={ctx.hidden} size="sm" />
            </div>
            <p className="text-[16px] text-muted mt-2 tabular-nums">{totals[i]} {totals[i] === 1 ? 'respuesta' : 'respuestas'}</p>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {sel && (
          <motion.div className="absolute inset-0 z-30 bg-graphite/60 backdrop-blur-sm grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-[1640px] bg-white rounded-[44px] p-[56px]" initial={{ scale: 0.94, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.45, ease }}>
              <p className="eyebrow text-[20px] text-brand">Caso {sel.number} · {sel.area}</p>
              <h2 className="font-display font-bold text-[48px] leading-[1.1] text-ink mt-2">{sel.title}</h2>
              <p className="font-display font-medium text-[26px] text-display mt-3">“{sel.quote}”</p>
              <div className="mt-10 flex flex-col gap-7">
                {OPTION_KEYS.map(k => {
                  const t = ctx.results.votos[sel.id], n = t?.[k] ?? 0, tot = t ? OPTION_KEYS.reduce((a, x) => a + t[x], 0) : 0, pct = tot ? (n / tot) * 100 : 0
                  return (
                    <div key={k} className="grid grid-cols-[72px_1fr_170px] items-center gap-7">
                      <span className="size-[72px] rounded-full bg-lilac-50 grid place-items-center font-display font-bold text-[34px] text-display">{k}</span>
                      <div>
                        <p className="text-[23px] leading-[1.35] text-text mb-2">{sel.options[k]}</p>
                        <div className="h-[30px] rounded-full bg-lilac-50 overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#4b22f4,#7d03ff)' }} animate={{ width: ctx.hidden ? '0%' : `${pct}%` }} transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
                        </div>
                      </div>
                      <p className="text-right font-display font-bold text-[44px] text-ink tabular-nums">{ctx.hidden ? '—' : `${Math.round(pct)}%`}<span className="block text-[18px] font-sans font-normal text-muted">{ctx.hidden ? '' : `${n} ${n === 1 ? 'voto' : 'votos'}`}</span></p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[18px] text-muted mt-8">Esc para volver a los seis casos.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Frame>
  )
}

function Bars({ t, hidden }: { t?: Record<OptionKey, number>; hidden: boolean; size: 'sm' }) {
  const tot = t ? OPTION_KEYS.reduce((a, k) => a + t[k], 0) : 0
  return (
    <>
      {OPTION_KEYS.map(k => {
        const n = t?.[k] ?? 0, pct = tot ? (n / tot) * 100 : 0
        return (
          <div key={k} className="grid grid-cols-[26px_1fr_64px] items-center gap-3">
            <span className="font-display font-bold text-[20px] text-display">{k}</span>
            <div className="h-[18px] rounded-full bg-white overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#4b22f4,#7d03ff)' }} initial={{ width: 0 }} animate={{ width: hidden ? '0%' : `${pct}%` }} transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
            </div>
            <span className="text-right font-display font-semibold text-[20px] text-ink tabular-nums">{hidden ? '—' : `${Math.round(pct)}%`}</span>
          </div>
        )
      })}
    </>
  )
}

/* ───────── ¿Por qué respondemos diferente? ───────── */
export function WhyDifferentSlide({ def, page, ctx }: SlideProps) {
  const data = content.cases.map(c => ({ c, t: ctx.results.votos[c.id], d: dispersion(ctx.results.votos[c.id]) }))
  const any = data.some(x => x.t && OPTION_KEYS.some(k => x.t![k] > 0))
  const max = Math.max(...data.map(x => x.d))
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] top-[170px] w-[1060px]">
        <Title size={68}>{def.title}</Title>
        <motion.p className="text-[28px] text-text mt-4" {...rise(0.15)}>{def.lead}</motion.p>
        <div className="mt-10 grid grid-cols-3 gap-x-8 gap-y-8">
          {data.map(({ c, t, d }, i) => {
            const n = t ? OPTION_KEYS.reduce((s, k) => s + t[k], 0) : 0
            const top = any && d === max && d > 0
            return (
              <motion.div key={c.id} className={`rounded-[24px] p-5 flex flex-col ${top ? 'bg-lilac-50 ring-2 ring-display' : 'bg-mist'}`} {...rise(0.2 + i * 0.06, 16)}>
                <div className="h-[52px] flex items-start">
                  <span className="font-display font-semibold text-[19px] leading-[1.3] text-ink line-clamp-2">{c.number} · {c.area}</span>
                </div>
                <div className="flex items-end gap-2 h-[110px] mt-4">
                  {OPTION_KEYS.map(k => {
                    const v = t?.[k] ?? 0, h = n ? Math.max(4, (v / n) * 110) : 4
                    return (
                      <div key={k} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div className="w-full rounded-t-[8px] bg-display" initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease }} />
                        <span className="font-display text-[16px] text-muted">{k}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[18px] text-muted mt-2">{n ? `Dispersión ${Math.round(d * 100)}%${top ? ' · la más alta' : ''}` : 'Sin votos'}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="absolute right-[96px] top-[170px] w-[560px]">
        <p className="eyebrow text-[20px] text-muted">Nuestras respuestas dependen de</p>
        <ul className="mt-6 flex flex-col gap-4">
          {(def.factors as string[]).map((f, i) => (
            <motion.li key={f} className="flex items-center gap-5 rounded-[22px] bg-white border border-line px-6 py-5" {...rise(0.3 + i * 0.08, 14)}>
              <span className="font-display font-bold text-display text-[24px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[27px] text-ink">{f}</span>
            </motion.li>
          ))}
        </ul>
        <p className="text-[18px] text-muted mt-6">Dispersión: 0% = todos eligieron lo mismo · 100% = votos repartidos por igual entre A, B, C y D.</p>
      </div>
    </Frame>
  )
}

/* ───────── Piezas compartidas ───────── */
function StatusPill({ open, pulseKey }: { open: boolean; pulseKey: number }) {
  const reduce = useReducedMotion()
  return (
    <div className={`flex items-center gap-4 rounded-full px-7 py-3.5 ${open ? 'bg-lilac-50' : 'bg-mist'}`}>
      <span className="relative grid place-items-center size-[18px]">
        <span className={`size-[14px] rounded-full ${open ? 'bg-sym-green' : 'bg-subtle'}`} />
        <AnimatePresence>
          {open && !reduce && pulseKey > 0 && (
            <motion.span key={pulseKey} className="absolute inset-0 rounded-full border-[3px] border-sym-green"
              initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} />
          )}
        </AnimatePresence>
      </span>
      <span className="eyebrow text-[20px] text-ink">{open ? 'Formulario abierto · en vivo' : 'Formulario cerrado'}</span>
    </div>
  )
}

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null), prev = useRef(value)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctrl = animate(prev.current, value, { duration: 0.6, ease: 'easeOut', onUpdate: v => { el.textContent = String(Math.round(v)) } })
    prev.current = value
    return () => ctrl.stop()
  }, [value])
  return <span ref={ref}>{value}</span>
}

export type { OptionKey }
export { Eyebrow }
