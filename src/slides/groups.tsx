import { AnimatePresence, motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { content, groupReading, type InterpKey, type OptionKey } from '../content'
import { TimerChip } from '../components/TimerChip'
import { TypingDots } from './intro'
import { ease, Eyebrow, Frame, Highlight, Num, rise, Title } from './kit'
import type { DeckCtx, SlideProps } from './types'

const GROUPS = [1, 2, 3, 4, 5, 6]

/* ───────── Seis QR de grupo + estado de respuesta ───────── */
export function GroupQRSlide({ def, page, ctx }: SlideProps) {
  const joined = new Set(ctx.results.unidos)
  const answered = ctx.results.interpretaciones
  const done = Object.keys(answered).length
  return (
    <Frame page={page} bg="bg-mist">
      <div className="absolute left-[96px] right-[96px] top-[150px] flex items-end justify-between gap-8">
        <div>
          <Title size={56}>{def.title}</Title>
          <motion.p className="text-[23px] text-text mt-2" {...rise(0.15)}>{def.lead}</motion.p>
          {def.questions && (
            <motion.div className="flex gap-3 mt-4" {...rise(0.25)}>
              {(def.questions as string[]).map((q, i) => <span key={q} className="rounded-full bg-white px-5 py-2 text-[19px] text-ink"><b className="font-display text-display mr-2">{i + 1}</b>{q}</span>)}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-5 shrink-0">
          {ctx.timer && <TimerChip t={ctx.timer} />}
          <p className="font-display font-semibold text-[24px] text-ink tabular-nums text-right leading-tight">{done}/6 respondieron<br /><span className="font-normal text-[18px] text-muted">{joined.size}/6 conectados</span></p>
        </div>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[400px] bottom-[96px] grid grid-cols-3 grid-rows-2 gap-6">
        {GROUPS.map((g, i) => {
          const ok = !!answered[g], on = joined.has(g) || ok
          return (
            <motion.div key={g} className={`rounded-[32px] bg-white flex items-center gap-7 px-7 border-[3px] transition-colors ${ok ? 'border-display' : on ? 'border-sym-green' : 'border-transparent'}`} {...rise(0.15 + i * 0.07, 24)}>
              <div className="p-1.5 bg-white rounded-xl"><QRCodeSVG value={ctx.groupUrl(g)} size={190} level="M" marginSize={0} /></div>
              <div>
                <p className="eyebrow text-[17px] text-brand">Grupo</p>
                <p className="font-display font-bold text-[76px] leading-none text-ink tabular-nums">{String(g).padStart(2, '0')}</p>
                <p className={`mt-3 flex items-center gap-2 text-[19px] ${ok ? 'text-display font-display font-semibold' : on ? 'text-ink' : 'text-subtle'}`}>
                  <span className={`size-3.5 rounded-full ${ok ? 'bg-display' : on ? 'bg-sym-green' : 'bg-line'}`} />
                  {ok ? 'Respondió' : on ? 'Conectado' : 'Esperando'}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ───────── Desafío de interpretación ───────── */
export function GroupChallengeSlide({ def, page, ctx }: SlideProps) {
  const sent = ctx.results.interpretaciones
  return (
    <Frame page={page}>
      {ctx.timer && <TimerChip t={ctx.timer} className="absolute right-[96px] top-[150px]" />}
      <div className="absolute left-[96px] top-[160px] w-[640px]">
        <Eyebrow>Actividad 02 · Descifrando al cliente</Eyebrow>
        <Title size={52} className="mt-3">{def.title}</Title>
        <motion.p className="text-[24px] leading-[1.4] text-text mt-5" {...rise(0.15)}>Cada grupo recibe una frase de cliente. En el celular eligen una opción por pregunta:</motion.p>
        <ol className="mt-6 flex flex-col gap-4">
          {(def.questions as string[]).map((q, i) => (
            <motion.li key={q} className="flex gap-4 items-start" {...rise(0.25 + i * 0.08, 12)}>
              <Num n={i + 1} className="text-[26px] pt-0.5" />
              <span className="font-display font-semibold text-[28px] leading-[1.3] text-ink">{q}</span>
            </motion.li>
          ))}
        </ol>
        <motion.p className="mt-8 text-[22px] leading-[1.4] text-muted border-l-[3px] border-rule pl-5" {...rise(0.6)}>Debatan antes de elegir: después cada grupo va a justificar su lectura.</motion.p>
      </div>
      <div className="absolute left-[800px] right-[96px] top-[260px] bottom-[110px] grid grid-cols-2 grid-rows-3 gap-4">
        {content.groupsA2.map((g, i) => (
          <motion.div key={g.group} className={`rounded-[24px] px-6 py-5 flex flex-col ${sent[g.group] ? 'bg-lilac-50 ring-2 ring-display' : 'bg-mist'}`} {...rise(0.25 + i * 0.06, 16)}>
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-[20px] text-ink">Grupo {String(g.group).padStart(2, '0')} · <span className="text-brand">{g.theme}</span></span>
              {sent[g.group] && <span className="eyebrow text-[15px] text-display">✓ Enviado</span>}
            </div>
            <p className="text-[22px] leading-[1.35] text-text mt-auto">“{g.quote}”</p>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

const QLABEL: Record<InterpKey, string> = { siente: 'Siente', busca: 'Busca', primera: 'Primero' }

/* ───────── Interpretación de cada grupo → (clic) necesidad real ───────── */
export function GroupResultsSlide({ def, page, step, ctx }: SlideProps) {
  const res = ctx.results.interpretaciones
  const reveal = step >= 1
  let hits = 0, total = 0
  content.groupsA2.forEach(g => { const n = groupReading(g, res[g.group]); if (n) { total++; if (n === g.need) hits++ } })
  const sel = ctx.selected && res[ctx.selected] ? ctx.selected : null
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]">
        <Title size={56} className="whitespace-nowrap">{def.title}</Title>
        <div className="flex items-baseline justify-between gap-8 mt-2">
          <motion.p className="text-[22px] text-text" {...rise(0.1)}>{reveal ? 'Lo que interpretó cada grupo frente a la necesidad real del cliente.' : 'Lo que interpretó cada grupo, según sus respuestas. Avanzá para ver la necesidad real.'}</motion.p>
          <AnimatePresence>
            {reveal && total > 0 && (
              <motion.p className="font-display font-semibold text-[24px] text-ink whitespace-nowrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {hits}/{total} <span className="font-normal text-muted">identificaron la necesidad real</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[290px] bottom-[96px] grid grid-cols-3 grid-rows-2 gap-6">
        {content.groupsA2.map((g, i) => {
          const r = res[g.group]
          const reading = groupReading(g, r)
          const ok = reading === g.need
          const letters = g.questions.map(q => (r?.[q.id] as string) || '–').join(' · ')
          return (
            <motion.div key={g.group} className={`relative rounded-[30px] px-7 py-6 flex flex-col overflow-hidden ${r ? 'bg-white border-2 border-line' : 'bg-mist'}`} {...rise(0.1 + i * 0.05, 18)}>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[20px] text-ink">Grupo {String(g.group).padStart(2, '0')}</span>
                <span className="text-[14px] text-subtle font-display">tecla {g.group}</span>
              </div>
              <p className="text-[18px] leading-[1.35] text-muted mt-1 line-clamp-2">“{g.quote}”</p>
              {r ? (
                <div className="mt-auto">
                  <p className="eyebrow text-[14px] text-muted">Respondieron {letters} · interpretaron</p>
                  <p className={`font-display font-bold text-[44px] leading-[1.05] mt-1 transition-colors ${reveal && !ok ? 'text-subtle line-through decoration-[3px]' : 'text-ink'}`}>{reading}</p>
                  <AnimatePresence>
                    {reveal && (
                      <motion.div className={`mt-3 rounded-[18px] px-5 py-3 flex items-center gap-3 ${ok ? 'bg-sym-green text-white neon-green' : 'bg-display text-white neon'}`}
                        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12, duration: 0.5, ease }}>
                        <span className="font-display font-bold text-[26px]">{ok ? '✓' : '→'}</span>
                        <div>
                          <p className="text-[14px] uppercase tracking-[.08em] font-display opacity-80">{ok ? 'Coincide con la necesidad real' : 'Necesidad real'}</p>
                          <p className="font-display font-bold text-[28px] leading-tight">{g.need}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-[19px] text-subtle flex items-center gap-3">Esperando respuesta <TypingDots delay={0} size={8} /></p>
                  {reveal && <p className="mt-3 rounded-[18px] px-5 py-3 bg-display text-white neon font-display neon"><span className="text-[14px] uppercase tracking-[.08em] opacity-80 block">Necesidad real</span><span className="font-bold text-[28px]">{g.need}</span></p>}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      <AnimatePresence>{sel && <InterpretationModal g={sel} ctx={ctx} reveal={reveal} />}</AnimatePresence>
    </Frame>
  )
}

function InterpretationModal({ g, ctx, reveal }: { g: number; ctx: DeckCtx; reveal: boolean }) {
  const r = ctx.results.interpretaciones[g]
  const meta = content.groupsA2.find(x => x.group === g)!
  return (
    <motion.div className="absolute inset-0 z-30 bg-graphite/60 backdrop-blur-sm grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="w-[1660px] bg-white rounded-[44px] p-[52px]" initial={{ scale: 0.94, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.45, ease }}>
        <p className="eyebrow text-[20px] text-brand">Grupo {String(g).padStart(2, '0')} · {meta.theme}</p>
        <p className="font-display font-bold text-[36px] leading-[1.2] text-ink mt-2">“{meta.quote}”</p>
        <div className="mt-5 flex gap-4 text-[22px]">
          <span className="rounded-full bg-lilac-50 px-5 py-2">Interpretaron: <b className="font-display">{groupReading(meta, r)}</b></span>
          {reveal && <span className="rounded-full bg-display text-white neon px-5 py-2">Necesidad real: <b className="font-display">{meta.need}</b></span>}
        </div>
        <div className="mt-6 flex flex-col gap-5">
          {meta.questions.map(q => {
            const mine = r[q.id] as OptionKey | ''
            const ok = mine === q.correct
            return (
              <div key={q.id} className="grid grid-cols-[300px_1fr] gap-8 border-t border-line pt-5">
                <p className="font-display font-semibold text-[24px] text-ink">{q.prompt}</p>
                <div className="flex flex-col gap-2">
                  <p className="text-[22px] text-ink"><b className="font-display text-display mr-2">{mine || '—'}</b>{mine ? q.options[mine] : 'Sin respuesta'} <span className="text-muted text-[18px]">· eligió el grupo{mine ? ` → ${q.tags[mine]}` : ''}</span></p>
                  {reveal && !ok && <p className="text-[22px] text-ink"><b className="font-display text-sym-green mr-2">{q.correct}</b>{q.options[q.correct]} <span className="text-muted text-[18px]">· respuesta correcta</span></p>}
                  {reveal && ok && <p className="text-[18px] text-sym-green font-display font-semibold">✓ Coincide con la respuesta correcta</p>}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[17px] text-muted mt-6">Esc para cerrar.</p>
      </motion.div>
    </motion.div>
  )
}

/* ───────── Etapa de análisis: un caso por diapositiva ───────── */
export function GroupAnalysisSlide({ def, page, ctx }: SlideProps) {
  const g = content.groupsA2.find(x => x.group === def.group)!
  const r = ctx.results.interpretaciones[g.group]
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]">
        <Eyebrow>Análisis · Grupo {String(g.group).padStart(2, '0')} · {g.theme}</Eyebrow>
        <motion.p className="font-display font-bold text-[40px] leading-[1.2] text-ink mt-3 max-w-[1650px]" {...rise(0.1)}>“<Highlight text={g.quote} marks={g.signals} />”</motion.p>
        <motion.div className="flex items-center gap-4 mt-3" {...rise(0.2)}>
          <span className="rounded-full bg-display text-white neon px-5 py-1.5 font-display font-semibold text-[20px]">Necesidad real: {g.need}</span>
          {r && <span className={`rounded-full px-5 py-1.5 text-[19px] ${groupReading(g, r) === g.need ? 'bg-sym-green text-white' : 'bg-mist text-text'}`}>El grupo interpretó: <b className="font-display">{groupReading(g, r)}</b></span>}
          <span className="text-[18px] text-muted">En violeta, las señales de la frase.</span>
        </motion.div>
      </div>
      <div className="absolute left-[96px] top-[380px] w-[1080px] bottom-[96px] flex flex-col gap-5">
        {g.questions.map((q, i) => (
          <motion.div key={q.id} className="rounded-[26px] bg-lilac-50 px-8 py-5" {...rise(0.25 + i * 0.12, 18)}>
            <div className="flex items-center gap-4">
              <span className="size-[42px] rounded-full bg-display text-white neon grid place-items-center font-display font-bold text-[20px] shrink-0">{q.correct}</span>
              <div className="min-w-0">
                <p className="eyebrow text-[14px] text-brand">{q.prompt}</p>
                <p className="font-display font-semibold text-[22px] leading-[1.25] text-ink">{q.options[q.correct]}</p>
              </div>
            </div>
            <p className="text-[19px] leading-[1.42] text-text mt-2.5">{q.why}</p>
          </motion.div>
        ))}
      </div>
      <div className="absolute left-[1216px] right-[96px] top-[380px] bottom-[96px] flex flex-col gap-5">
        <motion.div className="rounded-[26px] border-2 border-line px-7 py-5" {...rise(0.4, 18)}>
          <p className="eyebrow text-[15px] text-muted">Lo que eligió el grupo</p>
          {r ? (
            <div className="flex gap-6 mt-3">
              {g.questions.map(q => {
                const mine = r[q.id] as OptionKey | '', ok = mine === q.correct
                return (
                  <div key={q.id} className="flex items-center gap-2">
                    <span className={`size-[38px] rounded-full grid place-items-center font-display font-bold text-[18px] ${ok ? 'bg-sym-green text-white' : 'bg-mist text-muted'}`}>{mine || '—'}</span>
                    <span className="text-[16px] text-muted">{QLABEL[q.id]}</span>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-[18px] text-subtle mt-2">Sin respuesta</p>}
        </motion.div>
        <motion.div className="rounded-[26px] bg-mist px-7 py-5" {...rise(0.5, 18)}>
          <p className="eyebrow text-[15px] text-muted">Por qué no las otras</p>
          <p className="text-[19px] leading-[1.42] text-text mt-2">{g.othersMiss}</p>
        </motion.div>
        <motion.div className="rounded-[26px] bg-display text-white neon px-7 py-5 mt-auto" {...rise(0.6, 18)}>
          <p className="eyebrow text-[15px] text-white/75">Respaldo</p>
          <p className="font-display font-semibold text-[20px] mt-1">{g.backing.author}</p>
          <p className="text-[19px] leading-[1.4] text-white/90 mt-2">{g.backing.text}</p>
        </motion.div>
      </div>
    </Frame>
  )
}

/* ───────── Análisis en una sola diapositiva ───────── */
export function GroupSummarySlide({ def, page, ctx }: SlideProps) {
  const res = ctx.results.interpretaciones
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]">
        <Title size={56}>{def.title}</Title>
        <motion.p className="text-[24px] text-text mt-2" {...rise(0.1)}>{def.lead}</motion.p>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[320px] bottom-[96px] grid grid-cols-3 grid-rows-2 gap-6">
        {content.groupsA2.map((g, i) => {
          const reading = groupReading(g, res[g.group])
          const ok = reading === g.need
          return (
            <motion.div key={g.group} className="rounded-[30px] bg-mist p-7 flex flex-col" {...rise(0.15 + i * 0.08, 20)}>
              <p className="font-display font-medium text-[19px] leading-[1.3] text-ink line-clamp-3">“{g.quote}”</p>
              <div className="mt-auto flex items-center gap-3 pt-3">
                <div className="min-w-0">
                  <p className="eyebrow text-[13px] text-muted">Parece</p>
                  <p className="font-display font-semibold text-[18px] text-subtle line-through decoration-2 whitespace-nowrap">{g.theme}</p>
                </div>
                <span className="font-display text-[26px] text-rule">→</span>
                <div className="min-w-0">
                  <p className="eyebrow text-[13px] text-brand">Necesita</p>
                  <p className="font-display font-bold text-[28px] leading-none text-display whitespace-nowrap">{g.need}</p>
                </div>
                {reading && <span className={`ml-auto shrink-0 size-[40px] rounded-full grid place-items-center font-display font-bold text-[20px] text-white ${ok ? 'bg-sym-green' : 'bg-subtle'}`} title={`Grupo ${g.group}: ${reading}`}>{ok ? '✓' : '✗'}</span>}
              </div>
              <p className="text-[17px] leading-[1.4] text-text mt-3">{g.needWhy}</p>
            </motion.div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ───────── Introducción del roleplay ───────── */
export function RoleplayIntroSlide({ def, page }: SlideProps) {
  const roles: { name: string; desc: string }[] = def.roles
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]">
        <Eyebrow>Actividad 03 · Conversaciones bajo presión</Eyebrow>
        <Title size={64} className="mt-3">{def.title}</Title>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[360px] grid grid-cols-3 gap-6">
        {roles.map((r, i) => (
          <motion.div key={r.name} className={`rounded-[32px] p-[40px] h-[280px] flex flex-col ${i === 1 ? 'bg-display text-white' : 'bg-lilac-50'}`} {...rise(0.2 + i * 0.1, 30)}>
            <Num n={i + 1} className={`text-[24px] ${i === 1 ? '!text-white/80' : ''}`} />
            <h3 className={`font-display font-bold text-[40px] mt-auto ${i === 1 ? 'text-white' : 'text-ink'}`}>{r.name}</h3>
            <p className={`text-[24px] leading-[1.4] mt-2 ${i === 1 ? 'text-white/90' : 'text-text'}`}>{r.desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.div className="absolute left-[96px] right-[96px] top-[690px]" {...rise(0.6)}>
        <p className="eyebrow text-[18px] text-muted">Qué practicamos</p>
        <div className="flex flex-wrap gap-3 mt-3">
          {(def.skills as string[]).map((s, i) => <span key={s} className="rounded-full border-2 border-line px-5 py-2 text-[22px] text-ink"><span className="text-brand font-display font-semibold mr-2">{i + 1}</span>{s}</span>)}
        </div>
      </motion.div>
      <motion.p className="absolute left-[96px] right-[96px] top-[860px] text-[24px] text-ink flex items-center gap-4" {...rise(0.8)}>
        <span className="size-10 rounded-full bg-lilac-50 grid place-items-center text-display">✋</span>{def.privacy}
      </motion.p>
    </Frame>
  )
}

/* ───────── Actividad 03: cómo funciona + estado de cada grupo ───────── */
export function RoleplayRunSlide({ def, page, ctx }: SlideProps) {
  const ev = ctx.results.roleplay
  const steps: { name: string; desc: string }[] = def.steps ?? []
  return (
    <Frame page={page}>
      {ctx.timer && <TimerChip t={ctx.timer} className="absolute right-[96px] top-[150px]" />}
      <div className="absolute left-[96px] right-[420px] top-[160px]">
        <Title size={56}>{def.title}</Title>
        <motion.p className="text-[24px] leading-[1.4] text-text mt-3" {...rise(0.1)}>{def.lead}</motion.p>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[360px] grid grid-cols-4 gap-5">
        {steps.map((st, i) => (
          <motion.div key={st.name} className={`rounded-[28px] p-7 h-[230px] flex flex-col ${i === 2 ? 'bg-display text-white' : 'bg-lilac-50'}`} {...rise(0.2 + i * 0.1, 24)}>
            <span className={`font-display font-bold text-[48px] leading-none ${i === 2 ? 'text-white' : 'text-display'}`}>{i + 1}</span>
            <h3 className={`font-display font-bold text-[28px] mt-auto ${i === 2 ? 'text-white' : 'text-ink'}`}>{st.name}</h3>
            <p className={`text-[19px] leading-[1.35] mt-2 ${i === 2 ? 'text-white/90' : 'text-text'}`}>{st.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="absolute left-[96px] right-[96px] top-[630px] bottom-[96px] grid grid-cols-3 grid-rows-2 gap-4">
        {content.roleplay.cases.map((c, i) => {
          const done = !!ev[c.group]
          return (
            <motion.div key={c.group} className={`rounded-[24px] px-6 py-4 flex items-center gap-5 ${done ? 'bg-lilac-50 ring-2 ring-display' : 'bg-mist'}`} {...rise(0.5 + i * 0.05, 16)}>
              <span className="font-display font-bold text-[40px] text-display tabular-nums">{String(c.group).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="font-display font-bold text-[22px] text-ink truncate">{c.title}</p>
                <p className="text-[17px] text-muted">{c.professional} · <span className={done ? 'text-display font-semibold' : ''}>{done ? 'Evaluado' : 'En conversación'}</span></p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ───────── Resultados del roleplay ───────── */
export function RoleplayResultsSlide({ def, page, ctx }: SlideProps) {
  const ev = Object.entries(ctx.results.roleplay)
  const crit = content.roleplay.evaluation
  const avg = crit.map(c => {
    const v = ev.map(([, e]) => Number(e[c.id as keyof typeof e])).filter(n => n >= 1 && n <= 5)
    return { ...c, avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }
  })
  const scored = avg.filter(a => a.avg != null)
  const best = scored.length ? Math.max(...scored.map(a => a.avg!)) : null
  const worst = scored.length ? Math.min(...scored.map(a => a.avg!)) : null
  const sel = ctx.selected
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px] flex justify-between items-end">
        <Title size={60}>{def.title}</Title>
        <p className="font-display font-semibold text-[24px] text-ink">{ev.length}/6 evaluaciones</p>
      </div>
      <div className="absolute left-[96px] top-[290px] w-[860px] bottom-[150px] flex flex-col gap-6">
        <p className="eyebrow text-[18px] text-muted">Promedio de los grupos (1 a 5)</p>
        {avg.map(a => (
          <div key={a.id}>
            <div className="flex justify-between text-[23px] text-ink">
              <span>{a.label}{a.avg != null && a.avg === best && scored.length > 1 ? <span className="text-brand"> · más alto</span> : a.avg != null && a.avg === worst && scored.length > 1 ? <span className="text-muted"> · a practicar</span> : null}</span>
              <span className="font-display font-bold tabular-nums">{a.avg != null ? a.avg.toFixed(1) : '—'}</span>
            </div>
            <div className="h-[26px] rounded-full bg-lilac-50 overflow-hidden mt-2">
              <motion.div className="h-full rounded-full bg-display" animate={{ width: `${a.avg ? (a.avg / 5) * 100 : 0}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-[1020px] right-[96px] top-[290px] bottom-[150px] flex flex-col">
        <p className="eyebrow text-[18px] text-muted">La frase o el argumento que mejor funcionó</p>
        <div className="mt-4 flex flex-col gap-3 flex-1 min-h-0">
          {content.roleplay.cases.map(c => {
            const e = ctx.results.roleplay[c.group]
            const active = sel === c.group && e
            return (
              <motion.div key={c.group} layout className={`rounded-[20px] px-6 py-3.5 ${active ? 'bg-display text-white neon py-6' : e ? 'bg-lilac-50' : 'bg-mist'}`} transition={{ duration: 0.35, ease }}>
                <p className={`text-[16px] font-display font-semibold ${active ? 'text-white/75' : 'text-muted'}`}>Grupo {String(c.group).padStart(2, '0')} · {c.title}</p>
                <p className={`${active ? 'text-[30px] leading-[1.3] mt-2' : 'text-[20px] line-clamp-1'} ${e ? '' : 'text-subtle'}`}>{e?.frase ? `“${e.frase}”` : e ? '—' : 'Pendiente'}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
      <p className="absolute left-[96px] right-[96px] bottom-[100px] text-[19px] text-muted">{def.disclaimer}</p>
    </Frame>
  )
}

/* ───────── Compromiso final ───────── */
export function CommitmentSlide({ def, page, ctx }: SlideProps) {
  const comp = ctx.results.compromisos
  const n = Object.keys(comp).length
  return (
    <Frame page={page} bg="bg-graphite" tone="white">
      {ctx.timer && <TimerChip t={ctx.timer} dark className="absolute right-[96px] top-[150px]" />}
      <div className="absolute left-[96px] right-[440px] top-[160px]">
        <p className="eyebrow text-[20px] text-accent-dark">Compromiso final · por grupo</p>
        <motion.h2 className="font-display font-bold text-white text-[56px] leading-[1.1] mt-3" {...rise(0.1)}>{def.question}</motion.h2>
        <motion.p className="text-[24px] text-on-dark mt-4" {...rise(0.2)}>{def.lead}</motion.p>
      </div>
      {def.example && (
        <motion.div className="absolute left-[96px] right-[96px] top-[440px] flex items-center gap-5" {...rise(0.3)}>
          <span className="eyebrow text-[16px] text-on-dark/60 shrink-0">Por ejemplo</span>
          <p className="rounded-full border border-white/20 px-6 py-2.5 text-[22px] text-white italic">“{def.example}”</p>
        </motion.div>
      )}
      <div className="absolute left-[96px] right-[96px] top-[530px] bottom-[150px] grid grid-cols-3 grid-rows-2 gap-5">
        {GROUPS.map((g, i) => (
          <motion.div key={g} className={`rounded-[28px] p-7 flex flex-col ${comp[g] ? 'bg-white' : 'bg-white/5 border border-white/10'}`} {...rise(0.35 + i * 0.05, 16)}>
            <span className={`font-display font-bold text-[20px] ${comp[g] ? 'text-display' : 'text-on-dark/50'}`}>Grupo {String(g).padStart(2, '0')}</span>
            <AnimatePresence mode="wait">
              {comp[g] ? <motion.p key="t" className="text-[23px] leading-[1.35] text-ink mt-3 line-clamp-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>“{comp[g]}”</motion.p>
                : <p key="w" className="text-[19px] text-on-dark/40 mt-auto">Escribiendo…</p>}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <p className="absolute left-[96px] right-[96px] bottom-[96px] text-[20px] text-on-dark/70">{n}/6 reglas recibidas · {def.footnote}</p>
    </Frame>
  )
}
