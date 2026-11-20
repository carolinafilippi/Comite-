import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Lienzo fijo 1920×1080 escalado para entrar en cualquier pantalla, con letterbox. */
export const STAGE_W = 1920
export const STAGE_H = 1080

export function Stage({ children, background = '#0c0c0f' }: { children: ReactNode; background?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      setScale(Math.min(width / STAGE_W, height / STAGE_H))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden" style={{ background }}>
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden bg-white"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center center' }}
      >
        {children}
      </div>
    </div>
  )
}
