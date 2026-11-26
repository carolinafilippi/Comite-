import { motion, useReducedMotion } from 'motion/react'

/** Fondo de marca con movimiento lento y continuo (deriva + zoom suave). */
export function MovingBg({ src, opacity = 1, className = '' }: { src: string; opacity?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.img
        src={src} alt="" className="absolute inset-[-6%] w-[112%] h-[112%] object-cover max-w-none"
        style={{ opacity }}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={reduce ? { scale: 1, opacity } : { scale: [1.04, 1.12, 1.04], x: [0, -40, 20, 0], y: [0, 24, -16, 0], rotate: [0, 1.2, -0.8, 0], opacity }}
        transition={reduce ? { duration: 0 } : { duration: 26, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 1.4 } }}
      />
    </div>
  )
}

/** Manchas de color de marca que flotan detrás del contenido. */
export function FloatingBlobs({ items }: { items: { src: string; x: number; y: number; w: number; o?: number; d?: number }[] }) {
  const reduce = useReducedMotion()
  return (
    <>
      {items.map((b, i) => (
        <motion.img key={i} src={b.src} alt="" aria-hidden className="absolute pointer-events-none select-none max-w-none"
          style={{ left: b.x, top: b.y, width: b.w, opacity: b.o ?? 0.5 }}
          animate={reduce ? {} : { x: [0, 40, -20, 0], y: [0, -30, 20, 0], rotate: [0, 12, -8, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 18 + (b.d ?? i * 4), repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </>
  )
}

export interface DecorItem { e: string; x: number; y: number; s: number; d?: number }

/** Elementos 3D (emojis Fluent, licencia MIT, e íconos 3D de Avalon) que entran y flotan. */
export function Decor({ items }: { items?: DecorItem[] }) {
  const reduce = useReducedMotion()
  if (!items?.length) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-20" aria-hidden>
      {items.map((it, i) => {
        const src = it.e.startsWith('icon3d-') ? `brand/icons/${it.e}.png` : `emoji/${it.e}.png`
        return (
          <motion.div key={`${it.e}-${i}`} className="absolute" style={{ left: it.x, top: it.y, width: it.s, height: it.s }}
            initial={{ opacity: 0, scale: 0.3, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + (it.d ?? i * 0.25), type: 'spring', stiffness: 140, damping: 12 }}>
            <motion.img src={src} alt="" className="w-full h-full object-contain drop-shadow-[0_18px_24px_rgba(75,34,244,.22)]"
              animate={reduce ? {} : { y: [0, -16, 0, 10, 0], rotate: [0, 6, 0, -5, 0] }}
              transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} />
          </motion.div>
        )
      })}
    </div>
  )
}
