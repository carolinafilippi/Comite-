import { motion } from 'motion/react'

/** Cronómetro con cuenta regresiva: arranca solo al entrar al slide (T pausa/reanuda). */
export function TimerChip({ t, className = '', dark = false }: { t: { remaining: number; total: number; running: boolean }; className?: string; dark?: boolean }) {
  const mm = String(Math.floor(t.remaining / 60)).padStart(2, '0'), ss = String(t.remaining % 60).padStart(2, '0')
  const low = t.remaining <= 60 && t.remaining > 0
  const done = t.remaining === 0
  const frac = t.total ? t.remaining / t.total : 0
  const R = 26, C = 2 * Math.PI * R
  const color = low || done ? 'var(--color-sym-orange)' : dark ? '#b98aff' : 'var(--color-display)'
  return (
    <motion.div className={`flex items-center gap-4 rounded-full pl-3 pr-7 py-2.5 ${dark ? 'bg-white/10 text-white' : 'bg-white text-ink'} ${low || done ? 'neon-orange' : 'neon-soft'} ${className}`} role="timer"
      animate={low ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={low ? { duration: 1, repeat: Infinity } : {}}>
      <svg width="64" height="70" viewBox="0 0 64 70" aria-hidden>
        <rect x="27" y="0" width="10" height="7" rx="2" fill={color} />
        <rect x="30" y="6" width="4" height="5" fill={color} />
        <rect x="50" y="11" width="7" height="4" rx="2" transform="rotate(45 53 13)" fill={color} />
        <g transform="rotate(-90 32 40)">
          <circle cx="32" cy="40" r={R} fill="none" stroke={dark ? 'rgba(255,255,255,.2)' : 'var(--color-lilac-100)'} strokeWidth="6" />
          <circle cx="32" cy="40" r={R} fill="none" strokeWidth="6" strokeLinecap="round" stroke={color}
            strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </g>
        <motion.line x1="32" y1="40" x2="32" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round"
          style={{ originX: '32px', originY: '40px' }} animate={{ rotate: (1 - frac) * 360 }} transition={{ duration: 1, ease: 'linear' }} />
        <circle cx="32" cy="40" r="3.5" fill={color} />
      </svg>
      <div className="leading-none">
        <span className="font-display font-bold text-[40px] tabular-nums" style={{ color: low || done ? 'var(--color-sym-orange)' : undefined }}>{mm}:{ss}</span>
        <p className="text-[15px] mt-1 opacity-70 font-display uppercase tracking-[.08em]">{done ? '¡Tiempo!' : t.running ? 'Cuenta regresiva' : 'En pausa · T'}</p>
      </div>
    </motion.div>
  )
}
