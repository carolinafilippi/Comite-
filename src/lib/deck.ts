import { caseById, content, type SlideDef } from '../content'

export interface Screen {
  key: string
  def: SlideDef
  sub?: 'flash' | 'live' | 'analysis'
  steps: number      // pasos internos (revelado progresivo)
  page: string       // "bloque|número"
  title: string
  kind: 'chapter' | 'author' | 'flash' | 'reveal' | 'default'
}

const titleOf = (d: SlideDef) => {
  if (d.type === 'cover') return 'Portada'
  if (d.type === 'author') return content.authors.find(a => a.id === d.authorId)?.name ?? 'Autor'
  if (d.type === 'groupAnalysis') return `Análisis · Grupo ${String(d.group).padStart(2, '0')}`
  if (d.type === 'final') return 'Escuchar mejor. Pensar mejor. Responder mejor.'
  return (d.title ?? d.question ?? d.text ?? d.id) as string
}

/** Expande la lista de diapositivas del JSON en pantallas navegables. */
export function buildScreens(): Screen[] {
  const out: Screen[] = []
  let n = 0
  for (const def of content.slides) {
    if (def.type === 'case') {
      const c = caseById(def.caseId)
      const page = `${def.block}|${String(++n).padStart(2, '0')}`
      out.push({ key: `${def.id}-flash`, def, sub: 'flash', steps: 0, page, title: `Caso ${c.number} · ${c.area} — votación`, kind: 'flash' })
      out.push({ key: `${def.id}-live`, def, sub: 'live', steps: 0, page, title: `Caso ${c.number} — resultados en vivo`, kind: 'default' })
      out.push({ key: `${def.id}-analysis`, def, sub: 'analysis', steps: 0, page, title: `Caso ${c.number} — análisis`, kind: 'reveal' })
      continue
    }
    const steps = def.type === 'bigQuestion' ? def.follow.length : def.type === 'newStandard' ? def.pairs.length : def.type === 'groupResults' ? 1 : def.type === 'fourStepsFlow' ? def.steps.length - 1 : def.type === 'fourStepsExample' ? 1 + def.good.length : 0
    out.push({
      key: def.id, def, steps,
      page: `${def.block}|${String(++n).padStart(2, '0')}`,
      title: titleOf(def),
      kind: def.type === 'divider' ? 'chapter' : def.type === 'author' ? 'author' : 'default',
    })
  }
  return out
}
