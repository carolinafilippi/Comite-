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

export function SymbolsRow({ height = 44, className = '' }: { height?: number; className?: string }) {
  return <img src="brand/symbols/awa-symbols-row.png" alt="" aria-hidden style={{ height }} className={className} draggable={false} />
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
