import raw from './comite.json'

/** Todo el texto vive en comite.json: se edita ahí sin tocar componentes. */

export type OptionKey = 'A' | 'B' | 'C' | 'D'
export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D']

export interface CaseContent {
  id: string; number: string; area: string; title: string
  context: string[]; quote: string
  options: Record<OptionKey, string>
  recommended: OptionKey; recommendedNote?: string; alsoReasonable?: OptionKey[]
  rationale: string; risks: Partial<Record<OptionKey, string>>
  askBefore: string[]; debate: string; durationSec: number
}

export interface AuthorContent {
  id: string; name: string; initials?: string; years: string; discipline: string; concept: string
  contribution: string; principles?: string[]; application: string
  example: { leftLabel: string; left: string; rightLabel: string; right: string }
  caveat: string; source: { label: string; url: string }
  portrait?: { src: string; credit: string; license: string } | null
}

export interface RoleCard { context: string; goal: string; hidden?: string; behaviour?: string; keys?: string[]; lines: string[] }
export interface RoleplayCase { group: number; title: string; professional: string; summary: string; client: RoleCard; pro: RoleCard }

// Diapositivas: campos comunes + campos propios de cada tipo (ver comite.json)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SlideDef = { id: string; type: string; block: string; notes?: string; activity?: string; timerMin?: number; [k: string]: any }

export interface ComiteContent {
  meta: { title: string; subtitle: string; organization: string; presenter: string; presenterRole: string; eyebrow: string }
  blocks: { id: string; title: string; minutes: number }[]
  slides: SlideDef[]
  cases: CaseContent[]
  authors: AuthorContent[]
  groupsA2: { group: number; theme: string; quote: string; objective: string }[]
  needCategories: string[]
  roleplay: { evaluation: { id: string; label: string }[]; phraseQuestion: string; cases: RoleplayCase[] }
  sentimentSurvey: {
    loaded: boolean; period: string; clientsSurveyed: number | null; responses: number | null; scaleMax: number
    metrics: { id: string; label: string; value: number | null }[]
    strengths: string[]; improvements: string[]; comments: string[]
  }
  beliefsVsPerception: { items: { internal: string; client: string; kind: 'hecho' | 'interpretacion' }[] }
}

export const content = raw as unknown as ComiteContent
export const caseById = (id: string) => content.cases.find(c => c.id === id)!
export const authorById = (id: string) => content.authors.find(a => a.id === id)!
