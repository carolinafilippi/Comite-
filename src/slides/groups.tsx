import { AnimatePresence, motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { content } from '../content'
import { TimerChip } from '../components/TimerChip'
import { ease, Eyebrow, Frame, Num, rise, Title } from './kit'
import type { DeckCtx, SlideProps } from './types'

const GROUPS = [1, 2, 3, 4, 5, 6]

/* ───────── Seis QR de grupo ───────── */
export function GroupQRSlide({ def, page, ctx }: SlideProps) {
  const joined = new Set(ctx.results.unidos)
  return (
    <Frame page={page} bg="bg-mist">
      <div className="absolute left-[96px] right-[96px] top-[160px] flex items-end justify-between">
        <div><Title size={60}>{def.title}</Title><motion.p className="text-[25px] text-text mt-2" {...rise(0.15)}>{def.lead}</motion.p></div>
        <p className="font-display font-semibold text-[26px] text-ink tabular-nums">{joined.size}/6 conectados</p>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[340px] bottom-[110px] grid grid-cols-3 grid-rows-2 gap-6">
        {GROUPS.map((g, i) => {
          const on = joined.has(g)
          return (
            <motion.div key={g} className={`rounded-[32px] bg-white flex items-center gap-7 px-8 border-2 transition-colors ${on ? 'border-sym-green' : 'border-transparent'}`} {...rise(0.15 + i * 0.07, 24)}>
              <div className="p-2 bg-white rounded-xl"><QRCodeSVG value={ctx.groupUrl(g)} size={220} level="M" marginSize={0} /></div>
              <div>
                <p className="eyebrow text-[18px] text-brand">Grupo</p>
                <p className="font-display font-bold text-[84px] leading-none text-ink tabular-nums">{String(g).padStart(2, '0')}</p>
                <p className={`mt-4 flex items-center gap-2 text-[20px] ${on ? 'text-ink' : 'text-subtle'}`}>
                  <motion.span className={`size-3.5 rounded-full ${on ? 'bg-sym-green' : 'bg-line'}`} animate={on ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.6 }} />
                  {on ? 'Conectado' : 'Esperando'}
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
        <ol className="mt-8 flex flex-col gap-4">
          {(def.questions as string[]).map((q, i) => (
            <motion.li key={q} className="flex gap-4 items-start" {...rise(0.2 + i * 0.07, 12)}>
              <Num n={i + 1} className="text-[24px] pt-0.5" />
              <span className="text-[26px] leading-[1.35] text-ink">{q}</span>
            </motion.li>
          ))}
        </ol>
        <motion.p className="mt-8 text-[21px] text-muted" {...rise(0.7)}>Además, elijan la necesidad principal: es una hipótesis de trabajo, no un diagnóstico.</motion.p>
      </div>
      <div className="absolute left-[800px] right-[96px] top-[260px] bottom-[110px] grid grid-cols-2 grid-rows-3 gap-4">
        {content.groupsA2.map((g, i) => (
          <motion.div key={g.group} className={`rounded-[24px] px-6 py-5 flex flex-col ${sent[g.group] ? 'bg-lilac-50 ring-2 ring-display' : 'bg-mist'}`} {...rise(0.25 + i * 0.06, 16)}>
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-[20px] text-ink">Grupo {String(g.group).padStart(2, '0')} · <span className="text-brand">{g.theme}</span></span>
              {sent[g.group] && <span className="eyebrow text-[15px] text-display">✓ Respondido</span>}
            </div>
            <p className="text-[22px] leading-[1.35] text-text mt-auto">“{g.quote}”</p>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── Resultados de interpretación ───────── */
export function GroupResultsSlide({ def, page, ctx }: SlideProps) {
  const res = ctx.results.interpretaciones
  const cats = content.needCategories
  const count = Object.fromEntries(cats.map(c => [c, 0])) as Record<string, number>
  Object.values(res).forEach(r => { if (r.categoria in count) count[r.categoria]++ })
  const max = Math.max(1, ...Object.values(count))
  const sel = ctx.selected && res[ctx.selected] ? ctx.selected : null
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]"><Title size={60}>{def.title}</Title></div>
      <div className="absolute left-[96px] top-[280px] w-[1060px] bottom-[110px] grid grid-cols-3 grid-rows-2 gap-5">
        {content.groupsA2.map((g, i) => {
          const r = res[g.group]
          return (
            <motion.div key={g.group} className={`rounded-[28px] p-6 flex flex-col ${r ? 'bg-white border-2 border-display' : 'bg-mist'}`} {...rise(0.1 + i * 0.06, 20)}>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[22px] text-ink">Grupo {String(g.group).padStart(2, '0')}</span>
                <span className={`eyebrow text-[14px] px-3 py-1 rounded-full ${r ? 'bg-display text-white' : 'bg-white text-subtle'}`}>{r ? 'Respondido' : 'Pendiente'}</span>
              </div>
              <p className="text-[17px] text-muted mt-1">{g.theme}</p>
              {r ? (
                <>
                  <p className="text-[20px] leading-[1.35] text-ink mt-3 line-clamp-4">{r.necesidad}</p>
                  <p className="mt-auto font-display font-semibold text-[18px] text-display">{r.categoria === 'Otra' && r.categoriaOtra ? r.categoriaOtra : r.categoria} <span className="text-subtle font-normal">· tecla {g.group}</span></p>
                </>
              ) : <p className="text-[19px] text-subtle mt-auto">Esperando respuesta…</p>}
            </motion.div>
          )
        })}
      </div>
      <div className="absolute right-[96px] top-[280px] w-[560px] bottom-[110px] flex flex-col">
        <p className="eyebrow text-[19px] text-muted">Necesidad principal identificada</p>
        <div className="mt-5 flex flex-col gap-3">
          {cats.map(c => (
            <div key={c} className="grid grid-cols-[180px_1fr_40px] items-center gap-4">
              <span className="text-[21px] text-ink">{c}</span>
              <div className="h-[26px] rounded-full bg-lilac-50 overflow-hidden">
                <motion.div className="h-full rounded-full bg-display" animate={{ width: `${(count[c] / max) * 100}%` }} transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
              </div>
              <span className="font-display font-bold text-[22px] text-right tabular-nums">{count[c]}</span>
            </div>
          ))}
        </div>
        <p className="mt-auto text-[18px] leading-[1.4] text-muted">{def.chartNote}</p>
      </div>
      <AnimatePresence>{sel && <InterpretationModal g={sel} ctx={ctx} />}</AnimatePresence>
    </Frame>
  )
}

function InterpretationModal({ g, ctx }: { g: number; ctx: DeckCtx }) {
  const r = ctx.results.interpretaciones[g]
  const meta = content.groupsA2.find(x => x.group === g)!
  const qs = ['¿Qué dice literalmente?', '¿Qué podría estar sintiendo?', '¿Qué necesidad podría haber detrás?', '¿Qué preguntas haríamos para comprobarlo?', '¿Qué primera acción recomendaríamos?']
  const vals = [r.literal, r.siente, r.necesidad, r.preguntas, r.accion]
  return (
    <motion.div className="absolute inset-0 z-30 bg-graphite/60 backdrop-blur-sm grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="w-[1640px] h-[880px] bg-white rounded-[44px] p-[56px] flex flex-col" initial={{ scale: 0.94, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.45, ease }}>
        <div className="flex items-start justify-between gap-10">
          <div>
            <p className="eyebrow text-[20px] text-brand">Grupo {String(g).padStart(2, '0')} · {meta.theme}</p>
            <p className="font-display font-bold text-[38px] leading-[1.2] text-ink mt-2">“{meta.quote}”</p>
          </div>
          <span className="shrink-0 rounded-full bg-display text-white font-display font-semibold text-[22px] px-6 py-2.5">{r.categoria === 'Otra' && r.categoriaOtra ? r.categoriaOtra : r.categoria}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6 mt-10 flex-1 min-h-0">
          {qs.map((q, i) => (
            <div key={q} className={`min-h-0 ${i === 4 ? 'col-span-2' : ''}`}>
              <p className="eyebrow text-[16px] text-muted">{q}</p>
              <p className="text-[24px] leading-[1.4] text-ink mt-1.5 whitespace-pre-line line-clamp-4">{vals[i] || '—'}</p>
            </div>
          ))}
        </div>
        <p className="text-[17px] text-muted mt-4">Interpretación del grupo: es una hipótesis de trabajo. Esc para cerrar.</p>
      </motion.div>
    </motion.div>
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

/* ───────── Roleplay en curso ───────── */
export function RoleplayRunSlide({ def, page, ctx }: SlideProps) {
  const ev = ctx.results.roleplay
  return (
    <Frame page={page}>
      {ctx.timer && <TimerChip t={ctx.timer} className="absolute right-[96px] top-[150px]" />}
      <div className="absolute left-[96px] right-[400px] top-[160px]">
        <Eyebrow>Actividad 03 · Mismo QR de grupo</Eyebrow>
        <Title size={60} className="mt-3">{def.title}</Title>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[340px] bottom-[110px] grid grid-cols-3 grid-rows-2 gap-6">
        {content.roleplay.cases.map((c, i) => {
          const done = !!ev[c.group]
          return (
            <motion.div key={c.group} className={`rounded-[30px] p-8 flex flex-col ${done ? 'bg-lilac-50 ring-2 ring-display' : 'bg-mist'}`} {...rise(0.15 + i * 0.06, 20)}>
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-[22px] text-ink">Grupo {String(c.group).padStart(2, '0')}</span>
                <span className={`eyebrow text-[14px] px-3 py-1 rounded-full ${done ? 'bg-display text-white' : 'bg-white text-muted'}`}>{done ? 'Evaluado' : 'En conversación'}</span>
              </div>
              <h3 className="font-display font-bold text-[34px] leading-[1.1] text-display mt-4">{c.title}</h3>
              <p className="text-[22px] leading-[1.4] text-text mt-3">{c.summary}</p>
              <p className="text-[19px] text-muted mt-auto">Profesional: {c.professional}</p>
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
              <motion.div key={c.group} layout className={`rounded-[20px] px-6 py-3.5 ${active ? 'bg-display text-white py-6' : e ? 'bg-lilac-50' : 'bg-mist'}`} transition={{ duration: 0.35, ease }}>
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
  return (
    <Frame page={page} bg="bg-graphite" tone="white">
      {ctx.timer && <TimerChip t={ctx.timer} dark className="absolute right-[96px] top-[150px]" />}
      <div className="absolute left-[96px] right-[440px] top-[170px]">
        <motion.h2 className="font-display font-bold text-white text-[64px] leading-[1.1]" {...rise(0.1)}>{def.question}</motion.h2>
        <motion.p className="text-[26px] text-on-dark mt-5" {...rise(0.25)}>{def.lead}</motion.p>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[480px] bottom-[150px] grid grid-cols-3 grid-rows-2 gap-5">
        {GROUPS.map((g, i) => (
          <motion.div key={g} className={`rounded-[28px] p-7 flex flex-col ${comp[g] ? 'bg-white' : 'bg-white/5 border border-white/10'}`} {...rise(0.3 + i * 0.05, 16)}>
            <span className={`font-display font-bold text-[20px] ${comp[g] ? 'text-display' : 'text-on-dark/50'}`}>Grupo {String(g).padStart(2, '0')}</span>
            <AnimatePresence mode="wait">
              {comp[g] ? <motion.p key="t" className="text-[24px] leading-[1.35] text-ink mt-3 line-clamp-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>“{comp[g]}”</motion.p>
                : <p key="w" className="text-[20px] text-on-dark/40 mt-auto">Esperando…</p>}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <p className="absolute left-[96px] right-[96px] bottom-[96px] text-[20px] text-on-dark/70">{def.footnote}</p>
    </Frame>
  )
}
