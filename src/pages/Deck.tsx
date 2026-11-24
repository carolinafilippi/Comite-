import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DemoBadge } from '../components/Brand'
import { Stage } from '../components/Stage'
import { content, OPTION_KEYS } from '../content'
import { api, demo, IS_DEMO, IS_TEST_SESSION, publicUrl, SESION, useResultados } from '../lib/api'
import { buildScreens, type Screen } from '../lib/deck'
import { playBlip } from '../lib/sound'
import { A1ResultsSlide, WhyDifferentSlide } from '../slides/activity1'
import { CommitmentSlide, GroupAnalysisSlide, GroupChallengeSlide, GroupQRSlide, GroupResultsSlide, RoleplayIntroSlide, RoleplayResultsSlide, RoleplayRunSlide } from '../slides/groups'
import { ActivityIntroSlide, BigQuestionSlide, CoverSlide, DividerSlide, FinalSlide, LearnedSlide, NewStandardSlide, StatementSlide, TwoSkillsSlide } from '../slides/intro'
import { AuthorSlide, BeliefsSlide, FourStepsSlide, LimitsSlide, MatrixSlide, ProfessionalPlaceSlide, QuestionsListSlide, SayVsNeedSlide, SentimentSlide, SynthesisSlide } from '../slides/theory'
import type { DeckCtx, SlideProps } from '../slides/types'

const REGISTRY: Record<string, (p: SlideProps) => React.ReactElement> = {
  cover: CoverSlide, a1Results: A1ResultsSlide, groupAnalysis: GroupAnalysisSlide, bigQuestion: BigQuestionSlide, twoSkills: TwoSkillsSlide, statement: StatementSlide, activityIntro: ActivityIntroSlide,
  divider: DividerSlide, whyDifferent: WhyDifferentSlide, sayVsNeed: SayVsNeedSlide, author: AuthorSlide, synthesis: SynthesisSlide,
  sentiment: SentimentSlide, beliefs: BeliefsSlide, groupQR: GroupQRSlide, groupChallenge: GroupChallengeSlide, groupResults: GroupResultsSlide,
  questionsList: QuestionsListSlide, professionalPlace: ProfessionalPlaceSlide, matrix: MatrixSlide, fourSteps: FourStepsSlide, limits: LimitsSlide,
  roleplayIntro: RoleplayIntroSlide, roleplayRun: RoleplayRunSlide, roleplayResults: RoleplayResultsSlide, learned: LearnedSlide,
  newStandard: NewStandardSlide, commitment: CommitmentSlide, final: FinalSlide,
}

const TRANSITIONS = {
  chapter: { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 } },
  author: { initial: { opacity: 0, x: 80 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -60 } },
  flash: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, y: -30 } },
  reveal: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } },
  default: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } },
}

export const presenterChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('awa-presenter') : null
const POS_KEY = `awa-deck-${SESION}`
const REVIEW = IS_DEMO && !!(window.AVALON_CONFIG as { review?: boolean } | undefined)?.review

function readKey() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const k = q.get('k')
  if (k) { localStorage.setItem('awa-key', k); return k }
  return localStorage.getItem('awa-key') ?? ''
}

export function Deck() {
  const screens = useMemo(buildScreens, [])
  const clave = useMemo(readKey, [])
  const [pos, setPos] = useState<{ i: number; step: number }>(() => {
    try { const p = JSON.parse(localStorage.getItem(POS_KEY) || ''); if (p.i < screens.length) return p } catch { /* nada */ }
    return { i: 0, step: 0 }
  })
  const [hidden, setHidden] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [overview, setOverview] = useState(false)
  const [sound, setSound] = useState(false)
  const [toast, setToast] = useState('')
  const [timer, setTimer] = useState<{ remaining: number; total: number; running: boolean } | null>(null)
  const { data: results, offset, online, refresh } = useResultados()

  const screen = screens[pos.i]
  const def = screen.def

  useEffect(() => { localStorage.setItem(POS_KEY, JSON.stringify(pos)) }, [pos])
  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 1800) }

  /* ── Cambio de estado de la sala (solo con clave en modo real) ── */
  const setEstado = useCallback(async (body: Record<string, unknown>) => {
    const r = await api.post({ accion: 'estado', clave, ...body })
    if (!r.ok && r.error === 'clave') flash('Falta la clave de presentador: no se puede abrir ni cerrar la votación')
    refresh()
    return r
  }, [clave, refresh])

  /* ── Efectos al entrar en cada pantalla ── */
  const lastKey = useRef('')
  useEffect(() => {
    if (lastKey.current === screen.key) return
    lastKey.current = screen.key
    setSelected(null); setHidden(false)
    setTimer(def.timerMin ? { remaining: def.timerMin * 60, total: def.timerMin * 60, running: false } : null)
    const est = results.estado
    const a1Open = est.fase === 'a1' && est.abierta
    if (def.type === 'activityIntro') {
      if (!a1Open) setEstado({ fase: 'a1', caso: null, abierta: true, duracion: 3600 })
    } else if (def.activity === 'a1') {
      // resultados: no reabre; si el formulario está abierto, sigue abierto
    } else if (def.activity && est.fase !== def.activity) {
      setEstado({ fase: def.activity, abierta: false })
    } else if (def.block !== '01' && a1Open) {
      setEstado({ abierta: false })
    }
  }, [screen.key]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Temporizador de actividades ── */
  useEffect(() => {
    if (!timer?.running) return
    const id = window.setInterval(() => setTimer(t => {
      if (!t) return t
      const r = Math.max(0, t.remaining - 1)
      if (r === 0 && sound) playBlip('end')
      return { ...t, remaining: r, running: r > 0 }
    }), 1000)
    return () => clearInterval(id)
  }, [timer?.running, sound])

  /* ── Sonido al recibir votos ── */
  const totalVotes = Object.values(results.votos).reduce((s, t) => s + OPTION_KEYS.reduce((a, k) => a + t[k], 0), 0)
  const prevVotes = useRef(totalVotes)
  useEffect(() => { if (sound && totalVotes > prevVotes.current) playBlip('vote'); prevVotes.current = totalVotes }, [totalVotes, sound])

  /* ── Modo revisión: votos que van llegando solos y grupos que responden ── */
  useEffect(() => {
    if (!REVIEW) return
    // Actividad 01: sin votos automáticos; arranca en cero y solo suma respuestas reales (o la tecla D en demo)
    if (isA1) return
    const kind = def.type === 'groupChallenge' || def.type === 'groupResults' ? 'a2' : def.activity === 'a3' && def.type !== 'roleplayIntro' ? 'a3' : def.activity === 'compromiso' ? 'compromiso' : null
    if (def.type === 'groupQR' || kind) {
      const id = window.setTimeout(() => { demo.groups(kind ?? 'join'); refresh() }, kind ? 2500 : 1200)
      return () => clearTimeout(id)
    }
  }, [screen.key, results]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Navegación ── */
  const next = useCallback(() => setPos(p => (p.step < screens[p.i].steps ? { ...p, step: p.step + 1 } : p.i < screens.length - 1 ? { i: p.i + 1, step: 0 } : p)), [screens])
  const prev = useCallback(() => setPos(p => (p.step > 0 ? { ...p, step: p.step - 1 } : p.i > 0 ? { i: p.i - 1, step: screens[p.i - 1].steps } : p)), [screens])
  const goto = useCallback((i: number) => { setPos({ i: Math.max(0, Math.min(screens.length - 1, i)), step: 0 }); setOverview(false) }, [screens.length])

  const isA1 = def.type === 'activityIntro' || def.activity === 'a1'
  const toggleVote = useCallback(() => {
    if (!isA1) return
    const open = results.estado.abierta && results.estado.fase === 'a1'
    setEstado(open ? { abierta: false } : { fase: 'a1', caso: null, abierta: true, duracion: 3600 })
    flash(open ? 'Formulario cerrado' : 'Formulario abierto')
  }, [isA1, results.estado, setEstado])

  const toggleTimer = useCallback(() => setTimer(t => (t ? { ...t, running: !t.running && t.remaining > 0 } : t)), [])
  const addTime = useCallback((s: number) => setTimer(t => (t ? { ...t, remaining: Math.max(0, t.remaining + s), total: Math.max(t.total, t.remaining + s) } : t)), [])

  const simulate = useCallback(() => {
    if (!IS_DEMO) return
    if (isA1) content.cases.forEach(c => demo.votes(c.id, 3))
    else if (def.activity === 'a2' || def.type === 'groupResults') demo.groups('a2')
    else if (def.activity === 'a3') demo.groups('a3')
    else if (def.activity === 'compromiso') demo.groups('compromiso')
    else content.cases.forEach(c => demo.votes(c.id, 4))
    refresh(); flash('Datos simulados agregados')
  }, [def, isA1, refresh])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (overview && k === 'Escape') return setOverview(false)
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next() }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev() }
      else if (k === 'Home') goto(0)
      else if (k === 'End') goto(screens.length - 1)
      else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
      else if (k === 'o' || k === 'O') setOverview(o => !o)
      else if (k === 'v' || k === 'V') toggleVote()
      else if (k === 'h' || k === 'H') { setHidden(h => !h); flash(hidden ? 'Resultados visibles' : 'Resultados ocultos') }
      else if (k === 't' || k === 'T') toggleTimer()
      else if (k === '+' || k === '=') addTime(60)
      else if (k === '-') addTime(-60)
      else if (k === 'm' || k === 'M') { setSound(s => !s); flash(sound ? 'Sonido desactivado' : 'Sonido activado') }
      else if (k === 'n' || k === 'N') window.open(`${location.pathname}#/notas${IS_TEST_SESSION ? '?sesion=' + SESION : ''}`, 'awa-notas', 'width=1200,height=800')
      else if (/^[1-6]$/.test(k)) setSelected(s => (s === +k ? null : +k))
      else if (k === 'Escape') setSelected(null)
      else if ((k === 'd' || k === 'D') && IS_DEMO) simulate()
      else if ((k === 'x' || k === 'X') && IS_DEMO && confirm('¿Borrar todos los datos simulados de la demo?')) { demo.reset(); refresh() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goto, toggleVote, toggleTimer, addTime, simulate, overview, hidden, sound, screens.length, refresh])

  /* ── Vista de notas del presentador (otra ventana, misma compu) ── */
  useEffect(() => {
    presenterChannel?.postMessage({
      type: 'snapshot', i: pos.i, step: pos.step, total: screens.length,
      screens: screens.map(s => ({ title: s.title, block: s.def.block })),
      notes: privateNotes(screen.def.notes ?? '', def.type === 'a1Results' ? selected : null), timer, estado: results.estado, online, hidden,
      votos: null,
      grupos: { a2: Object.keys(results.interpretaciones).length, a3: Object.keys(results.roleplay).length, compromiso: Object.keys(results.compromisos).length, unidos: results.unidos.length },
    })
  })
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data
      if (m?.type !== 'cmd') return
      if (m.cmd === 'next') next(); else if (m.cmd === 'prev') prev(); else if (m.cmd === 'goto') goto(m.i)
      else if (m.cmd === 'vote') toggleVote(); else if (m.cmd === 'timer') toggleTimer(); else if (m.cmd === 'addTime') addTime(m.s)
      else if (m.cmd === 'hide') setHidden(h => !h)
    }
    presenterChannel?.addEventListener('message', onMsg)
    return () => presenterChannel?.removeEventListener('message', onMsg)
  }, [next, prev, goto, toggleVote, toggleTimer, addTime])

  const ctx: DeckCtx = {
    results, offset, hidden, selected, timer,
    voteUrl: publicUrl('/votar'),
    groupUrl: g => publicUrl(`/grupo/${g}`),
  }
  const Comp = REGISTRY[def.type]
  const t = TRANSITIONS[screen.kind]
  const node = Comp ? <Comp def={def} page={screen.page} step={pos.step} ctx={ctx} /> : null

  return (
    <Stage>
      <AnimatePresence mode="wait">
        <motion.div key={screen.key} className="absolute inset-0" initial={t.initial} animate={t.animate} exit={{ ...t.exit, transition: { duration: 0.25 } }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          {node}
        </motion.div>
      </AnimatePresence>

      {IS_DEMO && <DemoBadge text="Modo demo · datos simulados" />}
      {!IS_DEMO && IS_TEST_SESSION && <DemoBadge text={`Sesión de prueba · ${SESION}`} />}
      {!online && <div className="absolute bottom-6 right-6 z-50 rounded-full bg-graphite text-white text-[18px] px-5 py-2 flex items-center gap-3"><span className="size-3 rounded-full bg-sym-orange" />Reconectando…</div>}

      <AnimatePresence>
        {toast && (
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-graphite text-white font-display font-medium text-[22px] px-8 py-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast}</motion.div>
        )}
      </AnimatePresence>

      {overview && <Overview screens={screens} current={pos.i} onPick={goto} />}
      {REVIEW && <ReviewBar i={pos.i} total={screens.length} onPrev={prev} onNext={next} onOverview={() => setOverview(o => !o)} onVote={isA1 ? toggleVote : undefined} onReset={() => { demo.reset(); refresh(); goto(0) }} />}
    </Stage>
  )
}

function Overview({ screens, current, onPick }: { screens: Screen[]; current: number; onPick: (i: number) => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-white/97 backdrop-blur p-[80px] overflow-auto">
      <p className="eyebrow text-[22px] text-brand">Vista general · O o Esc para cerrar</p>
      <div className="grid grid-cols-3 gap-10 mt-8">
        {content.blocks.map(b => (
          <div key={b.id}>
            <p className="font-display font-bold text-[26px] text-ink">{b.id} · {b.title} <span className="text-muted font-normal text-[20px]">· {b.minutes} min</span></p>
            <ul className="mt-3 flex flex-col gap-1">
              {screens.map((s, i) => s.def.block === b.id && (
                <li key={s.key}>
                  <button onClick={() => onPick(i)} className={`w-full text-left rounded-xl px-4 py-2 text-[19px] leading-snug ${i === current ? 'bg-display text-white' : 'hover:bg-lilac-50 text-text'}`}>
                    <span className="tabular-nums opacity-60 mr-2">{String(i + 1).padStart(2, '0')}</span>{s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Barra flotante solo para revisar la demo (no aparece en el evento real). */
function ReviewBar({ i, total, onPrev, onNext, onOverview, onVote, onReset }: { i: number; total: number; onPrev: () => void; onNext: () => void; onOverview: () => void; onVote?: () => void; onReset: () => void }) {
  const b = 'h-[64px] px-7 rounded-full font-display font-semibold text-[22px] bg-white/10 hover:bg-white/20 text-white'
  return (
    <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-graphite/95 p-2 shadow-2xl">
      <button className={b} onClick={onPrev} aria-label="Anterior">←</button>
      <span className="text-white/70 text-[20px] tabular-nums px-2">{i + 1}/{total}</span>
      <button className={`${b} !bg-display`} onClick={onNext} aria-label="Siguiente">→</button>
      <button className={b} onClick={onOverview}>Índice</button>
      {onVote && <button className={b} onClick={onVote}>Abrir/cerrar formulario</button>}
      <button className={b} onClick={onReset}>Reiniciar</button>
      <a className={`${b} grid place-items-center`} href="#/">Celulares</a>
    </div>
  )
}

/** Notas privadas: al ampliar un caso, Gerson ve la recomendación sin proyectarla. */
function privateNotes(base: string, sel: number | null) {
  const c = sel ? content.cases[sel - 1] : null
  if (!c) return base
  const extra = c.alsoReasonable?.length ? ` También defendibles: ${c.alsoReasonable.join(', ')}.` : ''
  return `CASO ${c.number} · ${c.area}\nRecomendación inicial: ${c.recommended}. ${c.recommendedNote ?? ''}${extra}\n\n${c.rationale}\n\nAntes de decidir: ${c.askBefore.join(' / ')}\n\nPara debatir: ${c.debate}`
}
