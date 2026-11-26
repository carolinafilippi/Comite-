import { motion, useReducedMotion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { Logo, SymbolsRow } from '../components/Brand'
import { FloatingBlobs, MovingBg } from '../components/Motion'
import { content } from '../content'
import { TimerChip } from '../components/TimerChip'
import { ease, Eyebrow, Frame, Highlight, Num, rise, Title } from './kit'
import type { DeckCtx } from './types'
import type { SlideProps } from './types'

/* ───────── Portada ───────── */
export function CoverSlide() {
  const { meta } = content
    const lines = ['Lo que', 'el cliente', 'no dice']
  return (
    <div className="absolute inset-0 bg-white">
      <motion.div className="absolute top-[64px] left-[110px] right-[110px] flex items-start justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }}>
        <Logo variant="stacked" height={70} />
        <span className="eyebrow text-[20px] text-muted mt-2">{meta.eyebrow}</span>
      </motion.div>
      <div className="absolute left-[110px] top-[250px]">
        {lines.map((line, i) => (
          <div key={line} className="overflow-hidden pb-2">
            <motion.h1 className={`font-display font-bold leading-[1.02] tracking-[-0.02em] text-[172px] ${i === 2 ? 'text-display' : 'text-ink'}`}
              initial={{ y: '105%' }} animate={{ y: '0%' }} transition={{ delay: 0.55 + i * 0.16, duration: 1.1, ease }}>
              {line}{i === 2 && <TypingDots delay={1.7} />}
            </motion.h1>
          </div>
        ))}
      </div>
      <div className="absolute left-[110px] bottom-[150px] w-[980px]">
        <motion.p className="font-display font-medium text-[46px] leading-[1.3] text-ink" {...rise(1.75, 16)}>{meta.subtitle.split('construir confianza').map((t, i, a) => <span key={i}>{t}{i < a.length - 1 && <span className="text-display">construir confianza</span>}</span>)}</motion.p>
      </div>
      <motion.div className="absolute left-[110px] right-[110px] bottom-[64px] flex items-end justify-between"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1, duration: 0.8 }}>
        <span className="text-[22px] text-muted">{meta.presenter} · {meta.presenterRole}</span>
        <SymbolsRow height={40} />
      </motion.div>
    </div>
  )
}

export function TypingDots({ delay, size = 26 }: { delay: number; size?: number }) {
  const reduce = useReducedMotion()
  return (
    <span className="inline-flex align-baseline" style={{ gap: size * 0.7, marginLeft: size }} aria-hidden>
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="inline-block rounded-full bg-display" style={{ width: size, height: size }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 0.35, 1], scale: [0.4, 1, 1, 1] }}
          transition={{ delay: delay + i * 0.18, duration: 1.6, times: [0, 0.25, 0.6, 1] }} />
      ))}
    </span>
  )
}

/* ───────── La gran pregunta (revelado por pasos) ───────── */
export function BigQuestionSlide({ def, step }: SlideProps) {
  const follow: string[] = def.follow
  return (
    <Frame bg="bg-graphite" tone="white" footer={false}>
      <div className="absolute left-[110px] right-[420px] top-[230px]">
        <motion.h2 className="font-display font-bold text-white text-[88px] leading-[1.08]" {...rise(0.1)}>{def.question}</motion.h2>
      </div>
      <div className="absolute left-[110px] right-[110px] bottom-[110px] grid grid-cols-3 gap-8">
        {follow.map((q, i) => (
          <motion.div key={q} className="border-t-[3px] border-accent-dark pt-6"
            initial={{ opacity: 0, y: 30 }} animate={step > i ? { opacity: 1, y: 0 } : { opacity: 0.08, y: 0 }} transition={{ duration: 0.6, ease }}>
            <Num n={i + 1} className="!text-accent-dark text-[28px]" />
            <p className="font-display font-medium text-white text-[38px] leading-[1.25] mt-3">{q}</p>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── Las dos habilidades ───────── */
export function TwoSkillsSlide({ def, page }: SlideProps) {
  const skills: { name: string; desc: string; verbs: string[] }[] = def.skills
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[170px]">
        <Title size={84}>{def.title}</Title>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[360px] h-[440px] flex items-stretch">
        {skills.map((s, i) => (
          <motion.div key={s.name} className={`flex-1 rounded-[40px] p-[56px] flex flex-col ${i === 0 ? 'bg-lilac-50 pr-[96px]' : 'bg-display text-white pl-[96px]'}`}
            initial={{ opacity: 0, x: i === 0 ? -60 : 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12, duration: 0.9, ease }}>
            <span className={`eyebrow text-[22px] ${i === 0 ? 'text-brand' : 'text-white/75'}`}>Habilidad {i + 1}</span>
            <h3 className={`font-display font-bold text-[80px] leading-none mt-4 ${i === 0 ? 'text-display' : 'text-white'}`}>{s.name}</h3>
            <p className={`text-[32px] leading-[1.4] mt-6 ${i === 0 ? 'text-text' : 'text-white/90'}`}>{s.desc}</p>
            <div className="mt-auto flex gap-3">
              {s.verbs.map(v => <span key={v} className={`rounded-full px-5 py-2 text-[22px] font-medium ${i === 0 ? 'bg-white text-display' : 'bg-white/15 text-white'}`}>{v}</span>)}
            </div>
          </motion.div>
        ))}
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[120px] rounded-full bg-white border-[6px] border-mist grid place-items-center font-display font-bold text-[56px] text-display shadow-lg"
          initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.7, type: 'spring', stiffness: 160, damping: 14 }}>+</motion.div>
      </div>
      <motion.p className="absolute left-[96px] right-[96px] top-[840px] text-[28px] text-muted text-center" {...rise(0.9)}>{def.footnote}</motion.p>
    </Frame>
  )
}

/* ───────── Frase de impacto ───────── */
export function StatementSlide({ def }: SlideProps) {
  return (
    <Frame footer={false}>
      <FloatingBlobs items={[{ src: 'brand/blobs/blob-violet-sky.png', x: 1250, y: 520, w: 820, o: 0.28 }, { src: 'brand/blobs/blob-mint-blue.png', x: -260, y: -220, w: 620, o: 0.22, d: 6 }]} />
      <div className="absolute inset-x-[160px] top-0 bottom-0 flex flex-col justify-center">
        <motion.div className="w-[120px] h-[6px] bg-display mb-14 origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease }} />
        <motion.p className="font-display font-bold text-ink text-[80px] leading-[1.14] tracking-[-0.01em]" {...rise(0.15, 30)}>
          <Highlight text={def.text} marks={def.highlight} />
        </motion.p>
        {def.attribution && <motion.p className="eyebrow text-[22px] text-muted mt-14" {...rise(0.5)}>{def.attribution}</motion.p>}
      </div>
    </Frame>
  )
}

/* ───────── Divisor de capítulo ───────── */
export function DividerSlide({ def }: SlideProps) {
  return (
    <div className="absolute inset-0 bg-white overflow-hidden">
      <MovingBg src={`brand/bg/${def.bg}.jpg`} />
      <FloatingBlobs items={[{ src: 'brand/blobs/blob-lilac-blue.png', x: 1100, y: 80, w: 640, o: 0.45 }, { src: 'brand/blobs/blob-pink-orange.png', x: 1550, y: 560, w: 420, o: 0.35, d: 7 }]} />
      <div className="absolute top-[56px] left-[96px] right-[96px] flex justify-between">
        <Logo variant="stacked" height={58} /><SymbolsRow height={34} />
      </div>
      <div className="absolute left-[110px] right-[110px] bottom-[130px]">
        <div className="overflow-hidden">
          <motion.p className="font-display font-bold text-display text-[220px] leading-[0.9] tabular-nums" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>{def.number}</motion.p>
        </div>
        <motion.h2 className="font-display font-bold text-ink text-[104px] leading-[1.04] mt-6 max-w-[1500px]" {...rise(0.35, 40)}>{def.title}</motion.h2>
        <motion.p className="text-[36px] text-text mt-8 max-w-[1200px]" {...rise(0.55)}>{def.lead}</motion.p>
      </div>
    </div>
  )
}

/* ───────── Inicio de actividad individual ───────── */
export function ActivityIntroSlide({ def, page, ctx }: SlideProps) {
  return (
    <Frame page={page} bg="bg-mist">
      <div className="absolute left-[96px] top-[170px] w-[1080px]">
        <Eyebrow>Actividad {def.number} · {def.mode}</Eyebrow>
        <Title size={96} className="mt-4">{def.title}</Title>
        <motion.p className="font-display font-medium text-display text-[40px] mt-3" {...rise(0.15)}>{def.concept}</motion.p>
        <ol className="mt-12 flex flex-col gap-7">
          {(def.steps as string[]).map((s, i) => (
            <motion.li key={s} className="flex gap-7 items-start" {...rise(0.3 + i * 0.1)}>
              <Num n={i + 1} className="text-[34px] leading-[1.2] w-[64px] shrink-0" />
              <span className="text-[31px] leading-[1.4] text-text">{s}</span>
            </motion.li>
          ))}
        </ol>
        <motion.p className="mt-12 text-[26px] text-muted border-l-[3px] border-rule pl-5" {...rise(0.7)}>{def.disclaimer}</motion.p>
      </div>
      {ctx.timer && <TimerChip t={ctx.timer} className="absolute left-[96px] bottom-[100px]" />}
      <QRPanel url={ctx.voteUrl} className="absolute right-[96px] top-[170px] w-[560px] h-[760px]" label="Escaneá para responder" qrSize={360}
        footer={<ParticipantsLine ctx={ctx} />} />
    </Frame>
  )
}

function ParticipantsLine({ ctx }: { ctx: DeckCtx }) {
  const open = ctx.results.estado.abierta && ctx.results.estado.fase === 'a1'
  const counts = content.cases.map(c => { const t = ctx.results.votos[c.id]; return t ? t.A + t.B + t.C + t.D : 0 })
  const started = Math.max(0, ...counts), done = counts.length ? Math.min(...counts) : 0
  return (
    <div className="font-display text-white text-center">
      <p className="text-[26px] font-semibold flex items-center justify-center gap-3 tabular-nums"><span className={`size-3 rounded-full ${open ? 'bg-sym-green' : 'bg-subtle'}`} />{started} respondiendo</p>
      <p className="text-[19px] text-on-dark/60 mt-1 tabular-nums">{done} completaron los 6 casos</p>
    </div>
  )
}

export function QRPanel({ url, className = '', label, qrSize = 240, footer }: { url: string; className?: string; label: string; qrSize?: number; footer?: React.ReactNode }) {
  return (
    <motion.aside className={`bg-graphite rounded-[40px] px-[40px] py-[40px] flex flex-col items-center text-center ${className}`}
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.8, ease }}>
      <p className="eyebrow text-[22px] text-accent-dark">{label}</p>
      <div className="bg-white rounded-[24px] p-4 mt-6"><QRCodeSVG value={url} size={qrSize} level="M" marginSize={0} /></div>
      <p className="text-[19px] text-on-dark/80 mt-5 break-all leading-snug">{url.replace(/^https?:\/\//, '')}</p>
      {footer && <div className="mt-auto w-full">{footer}</div>}
    </motion.aside>
  )
}

/* ───────── Lo que nos llevamos ───────── */
export function LearnedSlide({ def, page }: SlideProps) {
  const items: { name: string; desc: string; where?: string }[] = def.items
  const icons = ['brand/symbols/awa-symbol-dots.png', 'brand/symbols/awa-symbol-arrow.png', 'brand/symbols/awa-symbol-ribbon.png']
  return (
    <Frame page={page}>
      <MovingBg src="brand/bg/bg-pastel-sky.jpg" opacity={0.6} />
      <div className="absolute left-[96px] right-[96px] top-[170px]"><Title size={72}>{def.title}</Title></div>
      <div className="absolute left-[96px] right-[96px] top-[360px] bottom-[130px] grid grid-cols-3 gap-[64px]">
        {items.map((it, i) => (
          <div key={it.name} className="relative min-w-0">
            <motion.div className={`h-full rounded-[44px] p-[48px] flex flex-col ${i === 2 ? 'bg-display text-white' : 'bg-white/90'}`} {...rise(0.25 + i * 0.25, 50)}>
              <motion.img src={icons[i]} alt="" aria-hidden className="h-[96px] w-fit origin-center"
                animate={[{ rotate: [0, 90, 90, 180, 180, 360] }, { x: [0, 14, 0], y: [0, -14, 0] }, { scaleX: [1, 0.75, 1.12, 1], rotate: [0, -10, 8, 0] }][i]}
                transition={{ duration: [6, 1.8, 2.8][i], repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }} />
              <h3 className={`font-display font-bold text-[54px] leading-[1.02] mt-auto ${i === 2 ? 'text-white' : 'text-display'}`}>{it.name}</h3>
              <p className={`text-[28px] leading-[1.35] mt-4 ${i === 2 ? 'text-white/90' : 'text-ink'}`}>{it.desc}</p>
              {it.where && <span className={`mt-6 w-fit rounded-full px-5 py-2 text-[19px] font-display font-medium ${i === 2 ? 'bg-white/15 text-white' : 'bg-lilac-50 text-display'}`}>{it.where}</span>}
            </motion.div>
            {i < items.length - 1 && <motion.span className="absolute top-1/2 -right-[50px] -translate-y-1/2 font-display font-bold text-[56px] text-display" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.25 }}>+</motion.span>}
          </div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── El nuevo estándar (pares revelados por pasos) ───────── */
export function NewStandardSlide({ def, page, step }: SlideProps) {
  const pairs: { instead: string; use: string }[] = def.pairs
  return (
    <Frame page={page}>
      <div className="absolute left-[96px] right-[96px] top-[160px]">
        <Title size={64}>{def.title}</Title>
        <motion.p className="font-display font-semibold text-display text-[26px] mt-4 tracking-[.04em]" {...rise(0.2)}>ESCUCHAR → FUNDAMENTAR → PROPONER → ACORDAR</motion.p>
      </div>
      <div className="absolute left-[96px] right-[96px] top-[360px] flex flex-col gap-5">
        <div className="grid grid-cols-[1fr_1.45fr] gap-8 px-2">
          <span className="eyebrow text-[19px] text-muted">En vez de</span><span className="eyebrow text-[19px] text-brand">Usá</span>
        </div>
        {pairs.map((p, i) => (
          <motion.div key={p.instead} className="grid grid-cols-[1fr_1.45fr] gap-8 items-stretch"
            initial={{ opacity: 0, y: 20 }} animate={step > i ? { opacity: 1, y: 0 } : { opacity: 0.12, y: 0 }} transition={{ duration: 0.55, ease }}>
            <p className="rounded-[24px] bg-mist px-8 py-6 text-[27px] leading-[1.35] text-muted line-through decoration-[2px] decoration-subtle">“{p.instead}”</p>
            <p className="rounded-[24px] bg-lilac-50 px-8 py-6 text-[27px] leading-[1.35] text-ink font-medium border-l-[6px] border-display">“{p.use}”</p>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── Última diapositiva ───────── */
export function FinalSlide({ def }: SlideProps) {
  const lines: string[] = def.title
  return (
    <div className="absolute inset-0">
      <MovingBg src="brand/bg/bg-violet-orange-cloud.jpg" />
      <div className="absolute top-[64px] left-[110px]"><Logo variant="stacked" height={70} /></div>
      <div className="absolute left-[110px] top-[260px]">
        {lines.map((l, i) => (
          <div key={l} className="overflow-hidden">
            <motion.p className={`font-display font-bold text-[136px] leading-[1.08] ${i === 2 ? 'text-display' : 'text-ink'}`}
              initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.3 + i * 0.25, duration: 1, ease }}>{l}</motion.p>
          </div>
        ))}
        <motion.p className="text-[40px] text-ink mt-12 font-light" {...rise(1.3)}>{def.subtitle}</motion.p>
      </div>
      <motion.div className="absolute right-[110px] bottom-[64px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}><SymbolsRow height={44} /></motion.div>
    </div>
  )
}
