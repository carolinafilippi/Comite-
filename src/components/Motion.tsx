import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

/** Fondo de marca con movimiento lento y continuo (deriva + zoom suave). */
export function MovingBg({ src, opacity = 1, className = '' }: { src: string; opacity?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.img
        src={src} alt="" className="absolute inset-[-6%] w-[112%] h-[112%] object-cover max-w-none"
        style={{ opacity }}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={reduce ? { scale: 1, opacity } : { scale: [1.04, 1.08, 1.04], x: [0, -18, 0], y: [0, 10, 0], opacity }}
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
          animate={reduce ? {} : { x: [0, 18, 0], y: [0, -14, 0] }}
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

/* ───────── Estilo de referencia: degradé pastel + grilla fina + formas glossy que se transforman ───────── */
export function GlassBg({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden
      style={{
        backgroundImage: 'linear-gradient(rgba(75,34,244,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(75,34,244,.05) 1px, transparent 1px), linear-gradient(135deg, #e9ddff 0%, #f6f2fd 45%, #ffffff 100%)',
        backgroundSize: '64px 64px, 64px 64px, 100% 100%',
      }} />
  )
}

type Shp = [number, number, number, number, number, number] // x, y, w, h, radius, opacity
const GRADS = [
  'linear-gradient(150deg, #8f7bff 0%, #4b22f4 100%)',
  'linear-gradient(160deg, #cfe9ff 0%, #3adbd7 100%)',
  'linear-gradient(200deg, #e6d8ff 0%, #b98aff 100%)',
  'linear-gradient(160deg, #ffb3c7 0%, #ff4a1c 100%)',
]
const SCENES: Shp[][] = [
  [[250, 290, 130, 130, 999, 1], [280, 320, 60, 60, 999, 0], [280, 320, 60, 60, 999, 0], [280, 320, 40, 40, 999, 0]],
  [[290, 300, 20, 20, 999, 0], [40, 230, 300, 300, 999, 1], [280, 90, 280, 280, 999, 0.95], [300, 320, 30, 30, 999, 0]],
  [[170, 260, 120, 120, 999, 1], [320, 90, 120, 360, 999, 1], [80, 180, 56, 220, 999, 0.9], [470, 200, 110, 270, 999, 1]],
  [[230, 410, 70, 70, 999, 1], [430, 170, 70, 70, 999, 1], [330, 290, 70, 70, 999, 1], [130, 520, 70, 70, 999, 0.8]],
]
/** Formas de color glossy que pasan de una composición a otra, como en las referencias. */
export function GlassShapes({ x, y, scale = 1, interval = 2600 }: { x: number; y: number; scale?: number; interval?: number }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI(v => (v + 1) % SCENES.length), interval)
    return () => clearInterval(t)
  }, [reduce, interval])
  const scene = SCENES[reduce ? 2 : i]
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, width: 640, height: 640, transform: `scale(${scale})`, transformOrigin: 'top left' }} aria-hidden>
      {scene.map(([sx, sy, w, h, r, o], k) => (
        <motion.div key={k} className="absolute"
          style={{ background: GRADS[k], boxShadow: '0 30px 60px -20px rgba(75,34,244,.35), inset 0 2px 0 rgba(255,255,255,.55)' }}
          initial={false}
          animate={{ left: sx, top: sy, width: w, height: h, borderRadius: r, opacity: o }}
          transition={{ type: 'spring', stiffness: 90, damping: 16, delay: k * 0.06 }} />
      ))}
    </div>
  )
}

/* ───────── Lupa que recorre palabras ocultas y las ilumina ───────── */
export function MagnifierWords({ words, field, box }: {
  words: { t: string; x: number; y: number }[]           // palabras que la lupa visita
  field: { t: string; x: number; y: number }[]           // palabras de fondo, apenas visibles
  box: { x: number; y: number; w: number; h: number }
}) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI(v => (v + 1) % words.length), 1900)
    return () => clearInterval(t)
  }, [reduce, words.length])
  const cur = words[i]
  const R = 120
  return (
    <div className="absolute pointer-events-none" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} aria-hidden>
      {field.map((f, k) => (
        <span key={`f${k}`} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 grid place-items-center text-white/15 text-[22px]"
          style={{ left: f.x, top: f.y, width: 150, height: 150 }}>{f.t}</span>
      ))}
      {words.map((w, k) => (
        <motion.span key={w.t} className="absolute -translate-x-1/2 -translate-y-1/2 font-display font-medium text-[30px] whitespace-nowrap"
          style={{ left: w.x, top: w.y }}
          animate={k === i
            ? { color: '#ffffff', scale: 1.18, textShadow: '0 0 18px rgba(185,138,255,.95), 0 0 42px rgba(125,3,255,.8)' }
            : { color: 'rgba(255,255,255,.22)', scale: 1, textShadow: '0 0 0 rgba(0,0,0,0)' }}
          transition={{ duration: 0.5, delay: k === i ? 0.35 : 0 }}>{w.t}</motion.span>
      ))}
      <motion.div className="absolute" style={{ width: R * 2, height: R * 2, marginLeft: -R, marginTop: -R }}
        initial={false} animate={{ left: cur.x, top: cur.y }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
        <div className="absolute inset-0 rounded-full border-[6px] border-white"
          style={{ background: 'radial-gradient(circle, rgba(185,138,255,.22) 0%, rgba(255,255,255,.04) 60%, transparent 72%)', boxShadow: '0 0 40px rgba(125,3,255,.45)' }} />
        <div className="absolute bg-white rounded-full" style={{ width: 16, height: 130, left: R * 2 - 34, top: R * 2 - 30, transform: 'rotate(-40deg)', transformOrigin: 'top center' }} />
      </motion.div>
    </div>
  )
}
