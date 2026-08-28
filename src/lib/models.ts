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
  /** 1 = mais poderoso. Ordena a lista de escolha. */
  rank: number
}

/**
 * O esquadrão do Joshua. Quanto mais forte o personagem, mais capaz o modelo:
 * o Capitão lidera, o Falcão vem logo atrás, e assim por diante.
 */
const SQUAD: AiModel[] = [
  {
    id: 'claude-opus-5',
    label: 'Capitão América',
    realName: 'Claude Opus',
    provider: 'anthropic',
    hint: 'O líder — raciocínio mais profundo',
    color: '#e0263c',
    rank: 1,
  },
  {
    id: 'claude-sonnet-5',
    label: 'Falcão',
    realName: 'Claude Sonnet',
    provider: 'anthropic',
    hint: 'Ágil e completo — o braço direito',
    color: '#2f6df0',
    rank: 2,
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Viúva Negra',
    realName: 'Gemini Pro',
    provider: 'google',
    hint: 'Estrategista — gratuito e capaz',
    color: '#a8bbdd',
    rank: 3,
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Soldado Invernal',
    realName: 'Claude Haiku',
    provider: 'anthropic',
    hint: 'Rápido e direto ao ponto',
    color: '#7f93bb',
    rank: 4,
  },
  {
    id: 'gemini-3.7-flash',
    label: 'Agente 13',
    realName: 'Gemini Flash',
    provider: 'google',
    hint: 'O mais veloz — gratuito',
    color: '#5b93ff',
    rank: 5,
  },
]

/** Ordenado por patente: o mais poderoso encabeça a lista. */
export const AI_MODELS: AiModel[] = [...SQUAD].sort((a, b) => a.rank - b.rank)

/** Agente 13 é o padrão por ser gratuito — trocar quando houver crédito na Anthropic. */
export const DEFAULT_MODEL_ID = 'gemini-3.7-flash'

export function findModel(id: string): AiModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}
