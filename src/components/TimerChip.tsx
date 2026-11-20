export function TimerChip({ t, className = '', dark = false }: { t: { remaining: number; total: number; running: boolean }; className?: string; dark?: boolean }) {
  const mm = Math.floor(t.remaining / 60), ss = String(t.remaining % 60).padStart(2, '0')
  const low = t.remaining <= 60 && t.remaining > 0
  const frac = t.total ? t.remaining / t.total : 0
  return (
    <div className={`flex items-center gap-4 rounded-full pl-3 pr-7 py-3 ${dark ? 'bg-white/10 text-white' : 'bg-lilac-50 text-ink'} ${className}`} role="timer">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" stroke={dark ? 'rgba(255,255,255,.2)' : 'var(--color-lilac-100)'} strokeWidth="5" />
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="5" strokeLinecap="round" stroke={low ? 'var(--color-sym-orange)' : dark ? '#b98aff' : 'var(--color-display)'}
          strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="font-display font-bold text-[34px] tabular-nums">{mm}:{ss}</span>
      {!t.running && t.remaining > 0 && <span className="text-[18px] opacity-60">pausa</span>}
      {t.remaining === 0 && <span className="text-[18px] font-display font-semibold text-sym-orange">tiempo</span>}
    </div>
  )
}
