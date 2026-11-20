import { motion } from 'motion/react'
import { authorById, content } from '../content'
import { ease, Eyebrow, Frame, Num, Pending, rise, Title } from './kit'
import type { SlideProps } from './types'

/* ───────── Lo que dice vs. lo que necesita ───────── */
export function SayVsNeedSlide({ def, page }: SlideProps) {
  const maybe: string[] = def.maybe
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px]"><Title size={72}>{def.title}</Title></div>
      <motion.div className="absolute left-[96px] top-[350px] w-[700px] h-[480px] rounded-[40px] bg-mist p-[52px] flex flex-col" {...rise(0.2, 30)}>
        <p className="eyebrow text-[20px] text-muted">El cliente dice</p>
        <p className="font-display font-bold text-ink text-[60px] leading-[1.1] mt-auto">“{def.says}”</p>
      </motion.div>
      <svg className="absolute left-[800px] top-[350px]" width="200" height="480" viewBox="0 0 200 480" fill="none" aria-hidden>
        {maybe.map((_, i) => {
          const y = 40 + i * 100
          return <motion.path key={i} d={`M8 240 C 100 240, 100 ${y}, 192 ${y}`} stroke="var(--color-rule)" strokeWidth="3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease }} />
        })}
      </svg>
      <div className="absolute left-[1000px] right-[96px] top-[350px] flex flex-col gap-[20px]">
        <p className="eyebrow text-[20px] text-brand -mt-10 mb-1">Podría estar expresando</p>
        {maybe.map((m, i) => (
          <motion.div key={m} className="h-[80px] rounded-[22px] bg-lilac-50 px-8 flex items-center text-[28px] text-ink" {...rise(0.7 + i * 0.09, 14)}>{m}</motion.div>
        ))}
      </div>
      <motion.p className="absolute left-[96px] right-[96px] top-[880px] font-display font-semibold text-[28px] text-display" {...rise(1.2)}>⚠ {def.warning}</motion.p>
    </Frame>
  )
}

/* ───────── Autor ───────── */
export function AuthorSlide({ def, page }: SlideProps) {
  const a = authorById(def.authorId)
  const initials = a.initials ?? a.name.split(' ').map(w => w[0]).join('')
  const hasPrinciples = !!a.principles?.length
  return (
    <Frame page={page}>
      <motion.aside className="absolute left-[96px] top-[176px] bottom-[120px] w-[520px] rounded-[40px] overflow-hidden bg-lilac-50 flex flex-col justify-between p-[52px]"
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease }}>
        <span className="font-display font-bold leading-none tracking-[-0.06em] text-transparent select-none whitespace-nowrap"
          style={{ WebkitTextStroke: '3px var(--color-display)', fontSize: initials.length > 2 ? 170 : 240 }} aria-hidden>{initials}</span>
        <div>
          <p className="eyebrow text-[19px] text-brand mb-4 leading-snug">{a.discipline}</p>
          <h2 className="font-display font-bold text-[52px] leading-[1.06] text-ink">{a.name}</h2>
          <p className="font-display font-medium text-[24px] text-muted mt-3 tabular-nums">{a.years}</p>
        </div>
      </motion.aside>

      <div className="absolute left-[680px] right-[96px] top-[176px] bottom-[120px] flex flex-col">
        <Eyebrow delay={0.2}>Concepto</Eyebrow>
        <motion.h3 className="font-display font-bold text-[64px] leading-[1.06] text-display mt-2" {...rise(0.3)}>{a.concept}</motion.h3>
        <motion.p className="text-[27px] leading-[1.48] text-text mt-5" {...rise(0.45)}>{a.contribution}</motion.p>

        {hasPrinciples && (
          <motion.ol className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6" {...rise(0.55)}>
            {a.principles!.map((p, i) => (
              <li key={p} className="flex gap-4 text-[24px] leading-[1.35] text-ink"><Num n={i + 1} className="text-[22px] pt-0.5" />{p}</li>
            ))}
          </motion.ol>
        )}

        <motion.div className={hasPrinciples ? 'mt-7' : 'mt-9'} {...rise(0.65)}>
          <p className="eyebrow text-[19px] text-muted mb-4">Aplicación · {a.application}</p>
          <div className="grid grid-cols-[1fr_auto_1.3fr] items-stretch gap-5">
            <Bubble label={a.example.leftLabel} text={a.example.left} tone="client" />
            <div className="flex items-center text-rule" aria-hidden>
              <svg width="50" height="32" viewBox="0 0 56 32" fill="none"><path d="M2 16h48m0 0L38 4m12 12L38 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <Bubble label={a.example.rightLabel} text={a.example.right} tone="pro" />
          </div>
        </motion.div>

        <motion.div className="mt-auto flex gap-8 items-end pt-5" {...rise(0.85)}>
          {a.caveat && <p className="text-[20px] leading-[1.42] text-muted flex-1 border-l-[3px] border-rule pl-5">{a.caveat}</p>}
          <p className={`text-[17px] leading-[1.4] text-muted ${a.caveat ? 'w-[500px]' : 'flex-1'}`}>
            <span className="eyebrow text-[15px] block mb-1">Fuente</span>{a.source.label}
          </p>
        </motion.div>
      </div>
    </Frame>
  )
}

function Bubble({ label, text, tone }: { label: string; text: string; tone: 'client' | 'pro' }) {
  const pro = tone === 'pro'
  return (
    <div className={`rounded-[28px] px-7 py-6 ${pro ? 'bg-display text-white' : 'bg-mist text-ink'}`}>
      <p className={`eyebrow text-[16px] mb-2 ${pro ? 'text-white/75' : 'text-muted'}`}>{label}</p>
      <p className={`text-[27px] leading-[1.3] ${pro ? 'font-medium' : 'font-display font-medium'}`}>“{text}”</p>
    </div>
  )
}

/* ───────── Secuencia (síntesis) ───────── */
export function SynthesisSlide({ def, page }: SlideProps) {
  const steps: { name: string; desc: string }[] = def.steps
  return (
    <Frame page={page} bg="bg-white">
      <motion.img src="brand/bg/bg-pastel-sky.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-70" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 1.2 }} />
      <div className="absolute left-[96px] right-[96px] top-[180px]"><Title size={104}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[470px] grid grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <motion.div key={s.name} className="relative rounded-[32px] bg-white/85 backdrop-blur p-[40px] h-[300px] flex flex-col" {...rise(0.3 + i * 0.14, 40)}>
            <Num n={i + 1} className="text-[30px]" />
            <h3 className="font-display font-bold text-[44px] text-ink mt-auto">{s.name}</h3>
            <p className="text-[24px] leading-[1.4] text-text mt-3">{s.desc}</p>
            {i < steps.length - 1 && <span className="absolute -right-[22px] top-1/2 -translate-y-1/2 z-10 size-[38px] rounded-full bg-display text-white grid place-items-center font-display text-[20px]">→</span>}
          </motion.div>
        ))}
      </div>
      <motion.p className="absolute left-[96px] right-[96px] top-[830px] text-[30px] text-ink" {...rise(1)}>{def.footnote}</motion.p>
    </Frame>
  )
}

/* ───────── Encuesta de sentimiento (sin datos inventados) ───────── */
export function SentimentSlide({ def, page }: SlideProps) {
  const s = content.sentimentSurvey
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px] flex items-end justify-between">
        <div><Title size={64}>{def.title}</Title><motion.p className="text-[26px] text-text mt-3" {...rise(0.15)}>{def.lead}{s.period ? ` · ${s.period}` : ''}</motion.p></div>
        <div className="flex gap-10 text-right">
          <Kpi label="Clientes encuestados" value={s.clientsSurveyed} />
          <Kpi label="Respuestas recibidas" value={s.responses} />
        </div>
      </div>
      <div className="absolute left-[96px] top-[400px] w-[1000px] flex flex-col gap-6">
        {s.metrics.map((m, i) => (
          <motion.div key={m.id} className="grid grid-cols-[400px_1fr_120px] items-center gap-6" {...rise(0.2 + i * 0.06, 12)}>
            <span className="text-[26px] text-ink">{m.label}</span>
            <div className="h-[30px] rounded-full bg-lilac-50 overflow-hidden">
              {m.value != null && <motion.div className="h-full bg-display rounded-full" initial={{ width: 0 }} animate={{ width: `${(m.value / s.scaleMax) * 100}%` }} transition={{ delay: 0.4, duration: 1, ease }} />}
            </div>
            <span className="font-display font-bold text-[28px] text-right tabular-nums">{m.value != null ? `${m.value}/${s.scaleMax}` : <span className="text-subtle">—</span>}</span>
          </motion.div>
        ))}
        {!s.loaded && <Pending small text="Datos pendientes de incorporar · la encuesta todavía no tiene resultados confirmados" />}
      </div>
      <div className="absolute right-[96px] top-[400px] w-[600px] bottom-[130px] flex flex-col gap-6">
        <ListBox title="Principales fortalezas" items={s.strengths} />
        <ListBox title="Oportunidades de mejora" items={s.improvements} />
        <ListBox title="Comentarios abiertos (anonimizados)" items={s.comments.map(c => `“${c}”`)} />
      </div>
    </Frame>
  )
}
function Kpi({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="font-display font-bold text-[64px] leading-none text-display tabular-nums">{value ?? '—'}</p>
      <p className="text-[19px] text-muted mt-2">{label}</p>
    </div>
  )
}
function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex-1 rounded-[24px] bg-mist px-7 py-5 overflow-hidden">
      <p className="eyebrow text-[17px] text-muted">{title}</p>
      {items.length ? <ul className="mt-2 text-[21px] leading-[1.4] text-ink">{items.slice(0, 3).map(t => <li key={t}>· {t}</li>)}</ul>
        : <p className="text-[20px] text-subtle mt-2">Pendiente de incorporar</p>}
    </div>
  )
}

/* ───────── Creemos vs. perciben ───────── */
export function BeliefsSlide({ def, page }: SlideProps) {
  const items = content.beliefsVsPerception.items
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px]"><Title size={60}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[330px] grid grid-cols-2 gap-8">
        <div className="flex items-center gap-4"><span className="size-4 rounded-full bg-subtle" /><span className="eyebrow text-[21px] text-muted">Lo que nosotros creemos</span></div>
        <div className="flex items-center gap-4"><span className="size-4 rounded-full bg-display" /><span className="eyebrow text-[21px] text-brand">Lo que los clientes perciben</span></div>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[400px] bottom-[130px] flex flex-col gap-5">
        {items.length ? items.slice(0, 4).map((it, i) => (
          <motion.div key={i} className="grid grid-cols-2 gap-8" {...rise(0.2 + i * 0.1, 16)}>
            <p className="rounded-[24px] bg-mist px-8 py-6 text-[26px] leading-[1.35] text-text">{it.internal}</p>
            <div className="rounded-[24px] bg-lilac-50 px-8 py-6 relative">
              <span className={`absolute top-4 right-5 eyebrow text-[15px] px-3 py-1 rounded-full ${it.kind === 'hecho' ? 'bg-display text-white' : 'bg-white text-muted border border-line'}`}>{it.kind === 'hecho' ? 'Hecho' : 'Interpretación'}</span>
              <p className="text-[26px] leading-[1.35] text-ink pr-36">{it.client}</p>
            </div>
          </motion.div>
        )) : (
          <div className="grid grid-cols-2 gap-8 h-full">
            <Pending text="Observaciones internas pendientes de incorporar" />
            <Pending text="Respuestas de clientes pendientes de incorporar" />
          </div>
        )}
      </div>
      <p className="absolute left-[96px] right-[96px] bottom-[96px] text-[20px] text-muted">Hecho = dato de la encuesta. Interpretación = lo que creemos que ese dato significa.</p>
    </Frame>
  )
}

/* ───────── Lista de preguntas ───────── */
export function QuestionsListSlide({ def, page }: SlideProps) {
  const [a, b] = (def.title as string).split('. ')
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] top-[170px] w-[720px]">
        <Title size={70}>{a}.</Title>
        <motion.p className="font-display font-bold text-display text-[70px] leading-[1.06] mt-3" {...rise(0.2)}>{b}</motion.p>
      </div>
      <div className="absolute left-[900px] right-[96px] top-[170px] bottom-[130px] flex flex-col justify-between">
        {(def.questions as string[]).map((q, i) => (
          <motion.div key={q} className="flex items-center gap-6 border-b border-line pb-5" {...rise(0.3 + i * 0.08, 14)}>
            <span className="font-display font-bold text-[26px] text-rule">?</span>
            <span className="text-[30px] leading-[1.3] text-ink">{q}</span>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── El lugar del profesional ───────── */
export function ProfessionalPlaceSlide({ def, page }: SlideProps) {
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px]"><Title size={70}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[400px] h-[340px] grid grid-cols-2 gap-0">
        {[def.client, def.agency].map((x: { label: string; text: string }, i: number) => (
          <motion.div key={x.label} className={`p-[52px] flex flex-col ${i === 0 ? 'bg-mist rounded-l-[40px]' : 'bg-display text-white rounded-r-[40px]'}`}
            initial={{ opacity: 0, x: i ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.8, ease }}>
            <p className={`eyebrow text-[22px] ${i ? 'text-white/75' : 'text-muted'}`}>{x.label}</p>
            <p className={`text-[36px] leading-[1.35] mt-auto ${i ? 'text-white' : 'text-ink'}`}>{x.text}</p>
          </motion.div>
        ))}
      </div>
      <motion.p className="absolute left-[96px] right-[96px] top-[800px] font-display font-semibold text-[34px] leading-[1.3] text-ink" {...rise(0.7)}>{def.together}</motion.p>
    </Frame>
  )
}

/* ───────── Matriz ceder / sostener ───────── */
export function MatrixSlide({ def, page }: SlideProps) {
  const rows: { situation: string; action: string; level: number }[] = def.rows
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px] flex items-end justify-between">
        <Title size={60}>{def.title}</Title>
        <div className="flex items-center gap-4 text-[20px] text-muted pb-2">
          <span>{def.scaleLabels[0]}</span>
          <div className="w-[220px] h-[10px] rounded-full" style={{ background: 'linear-gradient(90deg,#e6d8ff,#4b22f4)' }} />
          <span>{def.scaleLabels[1]}</span>
        </div>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[310px] flex flex-col gap-[14px]">
        {rows.map((r, i) => (
          <motion.div key={r.situation} className="grid grid-cols-[420px_1fr_360px] items-center gap-8 rounded-[22px] bg-mist px-8 h-[84px]" {...rise(0.15 + i * 0.07, 12)}>
            <span className="font-display font-semibold text-[25px] text-ink">{r.situation}</span>
            <span className="text-[26px] text-text">{r.action}</span>
            <div className="flex gap-2 justify-end">
              {[1, 2, 3, 4, 5].map(n => (
                <motion.span key={n} className="h-[18px] w-[56px] rounded-full" style={{ background: n <= r.level ? `color-mix(in srgb, #4b22f4 ${30 + n * 14}%, #e6d8ff)` : '#fff' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4 + i * 0.07 + n * 0.04, duration: 0.3 }} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── Cuatro pasos ───────── */
export function FourStepsSlide({ def, page }: SlideProps) {
  const steps: { name: string; desc: string }[] = def.steps
  const ex = def.example
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]"><Title size={60}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[270px] grid grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <motion.div key={s.name} className="rounded-[28px] bg-lilac-50 px-8 py-6" {...rise(0.15 + i * 0.1, 20)}>
            <div className="flex items-baseline gap-3"><Num n={i + 1} className="text-[24px]" /><h3 className="font-display font-bold text-[36px] text-ink">{s.name}</h3></div>
            <p className="text-[22px] leading-[1.4] text-text mt-2">{s.desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.div className="absolute left-[96px] right-[96px] top-[500px] bottom-[110px] grid grid-cols-[0.9fr_1.6fr] gap-6" {...rise(0.6)}>
        <div className="flex flex-col gap-5">
          <div className="rounded-[28px] bg-mist px-8 py-6">
            <p className="eyebrow text-[17px] text-muted">El cliente</p>
            <p className="font-display font-medium text-[28px] leading-[1.3] text-ink mt-2">“{ex.client}”</p>
          </div>
          <div className="rounded-[28px] border-2 border-line px-8 py-6 flex-1">
            <p className="eyebrow text-[17px] text-muted">✕ Respuesta reactiva</p>
            <p className="text-[25px] leading-[1.4] text-muted mt-2">“{ex.bad}”</p>
          </div>
        </div>
        <div className="rounded-[28px] bg-display text-white px-9 py-7">
          <p className="eyebrow text-[17px] text-white/75">✓ Respuesta mejorada</p>
          <p className="text-[25px] leading-[1.5] mt-3">
            “{(ex.good as string).split(/(\[[^\]]+\])/).map((p, i) => p.startsWith('[')
              ? <span key={i} className="inline-block align-middle mx-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[16px] font-display uppercase tracking-[.06em]">{p.slice(1, -1)}</span>
              : <span key={i}>{p}</span>)}”
          </p>
        </div>
      </motion.div>
    </Frame>
  )
}

/* ───────── Límites ───────── */
export function LimitsSlide({ def, page }: SlideProps) {
  const lv: { name: string; desc: string }[] = def.levels
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px]"><Title size={72}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[360px] h-[440px] flex items-end gap-6">
        {lv.map((l, i) => (
          <motion.div key={l.name} className={`flex-1 rounded-[36px] p-[44px] flex flex-col ${['bg-lilac-50', 'bg-lilac-100', 'bg-display text-white'][i]}`}
            style={{ height: 300 + i * 70 }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 300 + i * 70 }} transition={{ delay: 0.2 + i * 0.15, duration: 0.8, ease }}>
            <Num n={i + 1} className={`text-[26px] ${i === 2 ? '!text-white/80' : ''}`} />
            <h3 className={`font-display font-bold text-[60px] mt-auto ${i === 2 ? 'text-white' : 'text-ink'}`}>{l.name}</h3>
            <p className={`text-[26px] leading-[1.4] mt-3 ${i === 2 ? 'text-white/90' : 'text-text'}`}>{l.desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.p className="absolute left-[96px] right-[96px] top-[850px] text-[26px] text-muted" {...rise(0.8)}>{def.footnote}</motion.p>
    </Frame>
  )
}
