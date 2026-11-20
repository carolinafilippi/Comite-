import type { Resultados } from '../lib/api'
import type { SlideDef } from '../content'

export interface DeckCtx {
  results: Resultados
  offset: number
  hidden: boolean            // resultados ocultos durante una explicación
  selected: number | null    // tarjeta de grupo abierta (1–6)
  timer: { remaining: number; total: number; running: boolean } | null
  voteUrl: string
  groupUrl: (g: number) => string
}

export interface SlideProps {
  def: SlideDef
  page: string               // "bloque|número"
  step: number               // paso interno (revelados progresivos)
  sub?: 'flash' | 'live' | 'analysis'
  ctx: DeckCtx
}
