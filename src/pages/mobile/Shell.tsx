import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Logo } from '../../components/Brand'
import { IS_DEMO, IS_TEST_SESSION, SESION } from '../../lib/api'

export const mEase = [0.22, 1, 0.36, 1] as const

export function MobileShell({ right, children, online = true }: { right?: ReactNode; children: ReactNode; online?: boolean }) {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {IS_DEMO && <div className="bg-graphite text-white text-center text-[11px] font-display tracking-[.12em] uppercase py-1.5">Modo demo · no es una votación real</div>}
      {!IS_DEMO && IS_TEST_SESSION && <div className="bg-graphite text-white text-center text-[11px] font-display tracking-[.12em] uppercase py-1.5">Sesión de prueba · {SESION}</div>}
      <header className="px-5 pt-5 pb-4 flex items-center justify-between">
        <Logo variant="horizontal" height={22} />
        <span className="text-[13px] text-muted font-display tabular-nums">{right}</span>
      </header>
      {!online && <div className="mx-5 mb-2 rounded-xl bg-mist text-[13px] text-text px-4 py-2 flex items-center gap-2"><span className="size-2 rounded-full bg-sym-orange" />Sin conexión. Reintentando…</div>}
      {children}
    </div>
  )
}

export function StateScreen({ title, body, foot, icon }: { title: string; body: string; foot?: string; icon: 'check' | 'lock' | 'dots' }) {
  return (
    <motion.main className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-16"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: mEase }}>
      <div className="size-20 rounded-full bg-lilac-50 grid place-items-center mb-6">
        {icon === 'check' && (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
            <motion.path d="M8 19l7 7 13-15" stroke="#4b22f4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.5 }} />
          </svg>
        )}
        {icon === 'lock' && <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden><rect x="7" y="14" width="18" height="13" rx="3" stroke="#4b22f4" strokeWidth="3" /><path d="M11 14v-3a5 5 0 0110 0v3" stroke="#4b22f4" strokeWidth="3" /></svg>}
        {icon === 'dots' && (
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map(i => <motion.span key={i} className="size-2.5 rounded-full bg-display" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />)}
          </div>
        )}
      </div>
      <h1 className="font-display font-bold text-[26px] text-ink">{title}</h1>
      <p className="mt-3 text-[16px] leading-[1.5] text-text max-w-[320px]">{body}</p>
      {foot && <p className="mt-8 text-[13px] leading-[1.5] text-muted max-w-[300px]">{foot}</p>}
    </motion.main>
  )
}

export function PrimaryButton({ children, disabled, onClick, busy }: { children: ReactNode; disabled?: boolean; onClick: () => void; busy?: boolean }) {
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur border-t border-line z-10" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <button onClick={onClick} disabled={disabled || busy}
        className="w-full h-14 rounded-full font-display font-semibold text-[16px] text-white bg-display disabled:bg-lilac-100 disabled:text-muted transition-colors active:scale-[.99]">
        {busy ? 'Enviando…' : children}
      </button>
    </div>
  )
}
