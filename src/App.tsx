import { MotionConfig } from 'motion/react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Logo } from './components/Brand'
import { IS_DEMO, SESION } from './lib/api'
import { Deck } from './pages/Deck'
import { Grupo } from './pages/mobile/Grupo'
import { Votar } from './pages/mobile/Votar'
import { Notas } from './pages/Notas'

function Inicio() {
  const q = SESION !== 'COMITE' ? `?sesion=${SESION}` : ''
  return (
    <main className="min-h-dvh grid place-items-center p-8">
      <div className="max-w-xl w-full">
        <Logo variant="stacked" height={48} />
        <p className="eyebrow text-[13px] text-brand mt-10">Comité Avalon</p>
        <h1 className="font-display font-bold text-4xl text-ink mt-2">Lo que el cliente no dice</h1>
        <p className="text-muted mt-2">{IS_DEMO ? 'Simulado para revisar: los votos y las respuestas de grupos son datos de prueba que se generan solos.' : `Sesión: ${SESION}`}</p>
        <ul className="mt-8 space-y-3 text-lg">
          <li><Link className="text-display underline" to={`/presentacion${q}`}>Presentación (proyector)</Link></li>
          <li><Link className="text-display underline" to={`/votar${q}`}>Votación individual (celular)</Link></li>
          <li className="text-text text-base">Para ver cómo lo vive un participante, abrí la presentación, avanzá hasta un caso (se abre la votación) y después volvé acá y entrá a “Votación individual”.</li>
          <li className="text-text">Grupos: {[1, 2, 3, 4, 5, 6].map(g => <Link key={g} className="text-display underline mr-3" to={`/grupo/${g}${q}`}>{g}</Link>)}</li>
        </ul>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/presentacion" element={<Deck />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/votar" element={<Votar />} />
          <Route path="/grupo/:n" element={<Grupo />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}
