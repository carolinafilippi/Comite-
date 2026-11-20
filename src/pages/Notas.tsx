import { useEffect, useState } from 'react'
import { content } from '../content'
import { presenterChannel } from './Deck'

interface Snap {
  i: number; step: number; total: number; screens: { title: string; block: string }[]; notes: string
  timer: { remaining: number; total: number; running: boolean } | null
  estado: { fase: string; caso: string | null; abierta: boolean }; online: boolean; hidden: boolean
  votos: Record<string, number> | null; grupos: { a2: number; a3: number; compromiso: number; unidos: number }
}

/** Vista privada del presentador: abrir con la tecla N desde la presentación (misma compu, otra pantalla). */
export function Notas() {
  const [s, setS] = useState<Snap | null>(null)
  const [now, setNow] = useState(Date.now())
  const [start] = useState(Date.now())
  useEffect(() => {
    const on = (e: MessageEvent) => { if (e.data?.type === 'snapshot') setS(e.data) }
    presenterChannel?.addEventListener('message', on)
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => { presenterChannel?.removeEventListener('message', on); clearInterval(t) }
  }, [])
  const cmd = (c: string, extra = {}) => presenterChannel?.postMessage({ type: 'cmd', cmd: c, ...extra })

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); cmd('next') }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) cmd('prev')
      if (e.key === 'v' || e.key === 'V') cmd('vote')
      if (e.key === 't' || e.key === 'T') cmd('timer')
      if (e.key === 'h' || e.key === 'H') cmd('hide')
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  if (!s) return <div className="min-h-dvh grid place-items-center p-10 text-center text-text"><p>Esperando la presentación… Abrí esta ventana con la tecla <b>N</b> desde la presentación, en la misma compu.</p></div>
  const cur = s.screens[s.i], nxt = s.screens[s.i + 1]
  const block = content.blocks.find(b => b.id === cur.block)
  const el = Math.floor((now - start) / 1000)
  const vt = s.votos ? Object.values(s.votos).reduce((a, b) => a + b, 0) : null
  return (
    <div className="min-h-dvh bg-graphite text-white p-8 grid grid-cols-[1.4fr_1fr] gap-8 font-sans">
      <div className="flex flex-col gap-6">
        <div>
          <p className="eyebrow text-[13px] text-accent-dark">{block?.id} · {block?.title} · {block?.minutes} min</p>
          <h1 className="font-display font-bold text-[34px] leading-tight mt-2">{cur.title}</h1>
          <p className="text-on-dark/60 mt-1">Pantalla {s.i + 1} de {s.total}{s.step ? ` · paso ${s.step}` : ''}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 flex-1">
          <p className="eyebrow text-[12px] text-on-dark/60">Notas</p>
          <p className="text-[22px] leading-[1.5] mt-2 whitespace-pre-line">{s.notes || '—'}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Btn onClick={() => cmd('prev')}>← Anterior</Btn><Btn primary onClick={() => cmd('next')}>Siguiente →</Btn>
          <Btn onClick={() => cmd('vote')}>{s.estado.abierta ? 'Cerrar votación (V)' : 'Abrir votación (V)'}</Btn>
          <Btn onClick={() => cmd('hide')}>{s.hidden ? 'Mostrar resultados (H)' : 'Ocultar resultados (H)'}</Btn>
          {s.timer && <><Btn onClick={() => cmd('timer')}>{s.timer.running ? 'Pausar (T)' : 'Iniciar (T)'}</Btn><Btn onClick={() => cmd('addTime', { s: 60 })}>+1 min</Btn></>}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Box label="Próxima">{nxt?.title ?? 'Fin'}</Box>
        <Box label="Tiempo transcurrido"><span className="font-display text-[34px] tabular-nums">{Math.floor(el / 60)}:{String(el % 60).padStart(2, '0')}</span></Box>
        {s.timer && <Box label="Temporizador de actividad"><span className="font-display text-[34px] tabular-nums">{Math.floor(s.timer.remaining / 60)}:{String(s.timer.remaining % 60).padStart(2, '0')}</span> {s.timer.running ? '' : <span className="text-on-dark/60">· pausa</span>}</Box>}
        <Box label="Estado de la sala">
          <p>Actividad: <b>{s.estado.fase}</b>{s.estado.caso ? ` · caso ${s.estado.caso}` : ''} · {s.estado.abierta ? <span className="text-sym-green">votación abierta</span> : 'cerrada'}</p>
          {vt != null && <p className="mt-1">Votos en este caso: <b>{vt}</b></p>}
          <p className="mt-1">Grupos conectados: {s.grupos.unidos}/6 · A02: {s.grupos.a2}/6 · A03: {s.grupos.a3}/6 · Compromisos: {s.grupos.compromiso}/6</p>
          <p className="mt-1">{s.online ? 'Conexión OK' : <span className="text-sym-orange">Sin conexión con la planilla</span>}</p>
        </Box>
        <Box label="Teclas">
          <p className="text-[15px] leading-[1.6] text-on-dark/80">→/Espacio avanzar · ← volver · O vista general · F pantalla completa · V abrir/cerrar votación · H ocultar resultados · T temporizador · +/− minuto · 1–6 abrir tarjeta de grupo · Esc cerrar · M sonido</p>
        </Box>
      </div>
    </div>
  )
}
const Btn = ({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) =>
  <button onClick={onClick} className={`rounded-full px-5 h-12 font-display text-[15px] ${primary ? 'bg-display' : 'bg-white/10 hover:bg-white/20'}`}>{children}</button>
const Box = ({ label, children }: { label: string; children: React.ReactNode }) =>
  <div className="rounded-2xl bg-white/5 p-5"><p className="eyebrow text-[12px] text-on-dark/60 mb-1.5">{label}</p><div className="text-[18px]">{children}</div></div>
