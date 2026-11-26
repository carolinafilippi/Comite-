import { motion, useReducedMotion } from 'motion/react'
/** Assets originales del brandbook Avalon: nunca se redibujan ni recolorean. */

export function Logo({ variant = 'stacked', tone = 'black', height = 64, className = '' }: {
  variant?: 'stacked' | 'horizontal' | 'isotipo'
  tone?: 'black' | 'white'
  height?: number
  className?: string
}) {
  const file = variant === 'isotipo' ? `awa-isotipo-${tone}.png` : `awa-logo-${variant}-${tone}.png`
  return <img src={`brand/logos/${file}`} alt="Avalon World Agency®" style={{ height }} className={className} draggable={false} />
}

/** Los 5 símbolos de Avalon (archivos originales), cada uno con su propia animación en bucle. */
const SYMBOLS: { n: string; w: number; anim: Record<string, number[]>; dur: number }[] = [
  { n: 'dots', w: 245, anim: { rotate: [0, 90, 90, 180, 180, 360] }, dur: 6 },
  { n: 'bolt', w: 168, anim: { y: [0, -14, 0, 0], scale: [1, 1.12, 0.95, 1] }, dur: 2.4 },
  { n: 'ribbon', w: 246, anim: { scaleX: [1, 0.8, 1.1, 1], rotate: [0, -8, 6, 0] }, dur: 3.2 },
  { n: 'arrow', w: 248, anim: { x: [0, 8, 0], y: [0, -8, 0] }, dur: 1.8 },
  { n: 'circle', w: 250, anim: { scale: [1, 1.18, 1] }, dur: 2.6 },
]
export function SymbolsRow({ height = 44, className = '' }: { height?: number; className?: string }) {
  const reduce = useReducedMotion()
  const k = height / 253
  return (
    <div className={`flex items-center ${className}`} style={{ gap: 50 * k, height }} aria-hidden>
      {SYMBOLS.map((sym, i) => (
        <motion.img key={sym.n} src={`brand/symbols/awa-symbol-${sym.n}.png`} alt="" draggable={false}
          style={{ height: height * 0.97, width: sym.w * k }} className="object-contain"
          animate={reduce ? {} : sym.anim} transition={{ duration: sym.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35, repeatDelay: 0.6 }} />
      ))}
    </div>
  )
}

/** Header de slide interior: logo apilado arriba a la izquierda + fila de símbolos arriba a la derecha. */
export function SlideHeader({ tone = 'black' }: { tone?: 'black' | 'white' }) {
  return (
    <div className="absolute top-[56px] left-[96px] right-[96px] flex items-start justify-between pointer-events-none z-10">
      <Logo variant="stacked" tone={tone} height={58} />
      <SymbolsRow height={34} />
    </div>
  )
}

export function SlideFooter({ label, page, tone = 'dark' }: { label: string; page?: string; tone?: 'dark' | 'light' }) {
  const c = tone === 'dark' ? 'text-muted' : 'text-on-dark'
  return (
    <div className={`absolute bottom-[44px] left-[96px] right-[96px] flex items-center justify-between text-[20px] ${c} z-10`}>
      <span className="eyebrow text-[18px]">{label}</span>
      {page && <span className="font-display font-medium text-[20px] tabular-nums">{page}</span>}
    </div>
  )
}

/** Etiqueta obligatoria cuando se muestran datos que no provienen de la sesión real. */
export function DemoBadge({ text = 'Prototipo · datos simulados' }: { text?: string }) {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-graphite text-white font-display font-semibold uppercase tracking-[.12em] text-[18px] px-7 py-2.5 rounded-b-2xl shadow-lg flex items-center gap-3">
      <span className="size-3 rounded-full bg-sym-orange" aria-hidden />
      {text}
    </div>
  )
}
