import type { EmblemId } from '../components/HeroEmblem'

export type Provider = 'anthropic' | 'google'

export type AiModel = {
  id: string
  /** Codinome do esquadrão — a patente reflete o nível de inteligência. */
  label: string
  /** Nome real do modelo, mostrado em letra miúda. */
  realName: string
  provider: Provider
  hint: string
  color: string
  /** Emblema animado do herói. */
  emblem: EmblemId
  /** 1 = mais poderoso. Ordena a lista de escolha. */
  rank: number
}

/**
 * O esquadrão do Joshua. Quanto mais forte o herói, mais capaz o modelo —
 * o Capitão lidera (é o tema da casa), e os outros vêm por ordem de poder.
 */
const SQUAD: AiModel[] = [
  {
    id: 'claude-opus-5',
    label: 'Capitão América',
    realName: 'Claude Opus',
    provider: 'anthropic',
    hint: 'O líder — raciocínio mais profundo',
    color: '#e0263c',
    emblem: 'shield',
    rank: 1,
  },
  {
    id: 'claude-sonnet-5',
    label: 'Thor',
    realName: 'Claude Sonnet',
    provider: 'anthropic',
    hint: 'Poder bruto com precisão',
    color: '#6db3f2',
    emblem: 'hammer',
    rank: 2,
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Hulk',
    realName: 'Gemini Pro',
    provider: 'google',
    hint: 'Força imbatível — e gratuito',
    color: '#4caf50',
    emblem: 'fist',
    rank: 3,
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Homem de Ferro',
    realName: 'Claude Haiku',
    provider: 'anthropic',
    hint: 'Tecnologia rápida e afiada',
    color: '#f0a92c',
    emblem: 'reactor',
    rank: 4,
  },
  {
    id: 'gemini-3.7-flash',
    label: 'Homem-Aranha',
    realName: 'Gemini Flash',
    provider: 'google',
    hint: 'O mais ágil — gratuito',
    color: '#e34a4a',
    emblem: 'web',
    rank: 5,
  },
]

/** Ordenado por patente: o mais poderoso encabeça a lista. */
export const AI_MODELS: AiModel[] = [...SQUAD].sort((a, b) => a.rank - b.rank)

/** Homem-Aranha é o padrão por ser gratuito — trocar quando houver crédito na Anthropic. */
export const DEFAULT_MODEL_ID = 'gemini-3.7-flash'

export function findModel(id: string): AiModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}
