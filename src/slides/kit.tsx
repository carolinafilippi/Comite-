import { motion, type MotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import { SlideFooter, SlideHeader } from '../components/Brand'
import { DarkGlow, GlassBg } from '../components/Motion'
import { content, type OptionKey } from '../content'

export const ease = [0.22, 1, 0.36, 1] as const

/** Aparición escalonada estándar. */
export const rise = (delay = 0, y = 24): MotionProps => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.75, ease },
})

/** Marco de slide interior: fondo, header de marca y pie con capítulo + número. */
export function Frame({ children, page, bg = 'bg-white', footer = true, header = true, tone = 'black' }: {
  children: ReactNode; page?: string; bg?: string; footer?: boolean; header?: boolean; tone?: 'black' | 'white'
}) {
  return (
    <div className={`absolute inset-0 ${bg}`}>
      {bg.includes('graphite') ? <DarkGlow /> : <GlassBg />}
      {header && <SlideHeader tone={tone} />}
      {children}
      {footer && page && <SlideFooter label={chapterLabel(page)} page={page.split('|')[1]} tone={tone === 'white' ? 'light' : 'dark'} />}
    </div>
  )
}

/** page = "02|14" → bloque + número */
export function chapterLabel(page: string) {
  const [blockId] = page.split('|')
  const b = content.blocks.find(x => x.id === blockId)
  return b ? `${b.id} · ${b.title}` : ''
}

export function Eyebrow({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.p className={`eyebrow text-[22px] text-brand ${className}`} {...rise(delay, 12)}>{children}</motion.p>
}

export function Title({ children, className = '', size = 72, delay = 0.08 }: { children: ReactNode; className?: string; size?: number; delay?: number }) {
  return (
    <motion.h2 className={`font-display font-bold leading-[1.06] tracking-[-0.01em] text-ink ${className}`} style={{ fontSize: size }} {...rise(delay)}>
      {children}
    </motion.h2>
  )
}

/** Resalta fragmentos de una frase en violeta display. */
export function Highlight({ text, marks = [] }: { text: string; marks?: string[] }) {
  if (!marks.length) return <>{text}</>
  const re = new RegExp(`(${marks.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return <>{text.split(re).map((p, i) => (marks.includes(p) ? <span key={i} className="hl">{p}</span> : <span key={i}>{p}</span>))}</>
}

/** Píldora de número ("01") con estilo de marca. */
export function Num({ n, className = '' }: { n: string | number; className?: string }) {
  return <span className={`font-display font-bold text-display tabular-nums ${className}`}>{String(n).padStart(2, '0')}</span>
}

/** Nivel de dispersión 0–1 (entropía normalizada) de una distribución A/B/C/D. */
export function dispersion(t?: Record<OptionKey, number>) {
  if (!t) return 0
  const v = Object.values(t), n = v.reduce((a, b) => a + b, 0)
  if (n < 2) return 0
  const h = -v.filter(x => x > 0).reduce((s, x) => s + (x / n) * Math.log(x / n), 0)
  return h / Math.log(4)
}

export function Pending({ text = 'Datos pendientes de incorporar', small = false }: { text?: string; small?: boolean }) {
  return (
    <div className={`border-2 border-dashed border-rule rounded-[28px] grid place-items-center text-center ${small ? 'p-6' : 'p-10'} bg-lilac-50/40`}>
      <div>
        <p className={`eyebrow text-muted ${small ? 'text-[18px]' : 'text-[22px]'}`}>{text}</p>
      </div>
    </div>
  )
}
