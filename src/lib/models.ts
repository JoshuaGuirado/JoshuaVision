export type Provider = 'anthropic' | 'google'

export type AiModel = {
  id: string
  label: string
  provider: Provider
  /** Texto curto que ajuda a escolher o modelo na interface. */
  hint: string
}

/**
 * Os modelos da Anthropic exigem créditos comprados no console deles; o Gemini
 * tem camada gratuita. Enquanto não houver crédito, a interface deixa isso
 * explícito em vez de deixar o Joshua descobrir por um erro no meio da conversa.
 */
export const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: 'Claude',
  google: 'Gemini',
}

export const AI_MODELS: AiModel[] = [
  {
    id: 'claude-opus-5',
    label: 'Opus',
    provider: 'anthropic',
    hint: 'O mais inteligente — para raciocínio pesado',
  },
  {
    id: 'claude-sonnet-5',
    label: 'Sonnet',
    provider: 'anthropic',
    hint: 'Equilíbrio entre qualidade e velocidade',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Haiku',
    provider: 'anthropic',
    hint: 'O mais rápido e barato',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini Pro',
    provider: 'google',
    hint: 'Modelo avançado do Google',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini Flash',
    provider: 'google',
    hint: 'Versão rápida do Gemini',
  },
]

/** Gemini Flash é o padrão por ser gratuito — trocar quando houver crédito na Anthropic. */
export const DEFAULT_MODEL_ID = 'gemini-2.5-flash'

export function findModel(id: string): AiModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}
