import { useState } from 'react'
import { supabase } from './supabase'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Conversa com o proxy de IA. Usado tanto pela bolha flutuante quanto pela
 * tela cheia do assistente, para as duas se comportarem igual.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(text: string, modelId: string) {
    const history: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(history)
    setError(null)
    setSending(true)

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Sessão expirada. Entre novamente.')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ model: modelId, messages: history }),
      })

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null)
        throw new Error(detail?.error ?? `Falha na resposta (${res.status})`)
      }

      setMessages([...history, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: acc }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
      setMessages(history)
    } finally {
      setSending(false)
    }
  }

  return { messages, sending, error, send }
}
