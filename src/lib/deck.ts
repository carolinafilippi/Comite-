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
    const steps = def.type === 'bigQuestion' ? def.follow.length : def.type === 'newStandard' ? def.pairs.length : 0
    out.push({
      key: def.id, def, steps,
      page: `${def.block}|${String(++n).padStart(2, '0')}`,
      title: titleOf(def),
      kind: def.type === 'divider' ? 'chapter' : def.type === 'author' ? 'author' : 'default',
    })
  }
  return out
}
