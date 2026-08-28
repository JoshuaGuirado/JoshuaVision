import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, Sparkles, ChevronDown } from 'lucide-react'
import { AI_MODELS, DEFAULT_MODEL_ID, PROVIDER_LABEL, findModel } from '../../lib/models'
import { supabase } from '../../lib/supabase'

type Message = { role: 'user' | 'assistant'; content: string }

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const history = [...messages, { role: 'user' as const, content: text }]
    setMessages(history)
    setInput('')
    setError(null)
    setSending(true)

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Sessão expirada. Entre novamente.')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model: modelId, messages: history }),
      })

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null)
        throw new Error(detail?.error ?? `Falha na resposta (${res.status})`)
      }

      // Cria a bolha da resposta e vai preenchendo conforme o texto chega.
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

  const activeModel = findModel(modelId)

  return (
    <div className="flex flex-col h-[calc(100svh-9rem)] md:h-[calc(100svh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Assistente</h1>

        <div className="relative">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-text-dim hover:text-text
                       border border-border rounded-lg px-3 py-1.5 transition-colors"
          >
            {activeModel?.label ?? 'Modelo'}
            <ChevronDown size={14} />
          </button>

          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute right-0 mt-1 w-60 bg-surface border border-border rounded-xl p-1 z-20 shadow-xl">
                {AI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModelId(m.id)
                      setPickerOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      m.id === modelId ? 'bg-accent/10 text-accent' : 'hover:bg-surface-2'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {m.label}
                      <span className="text-text-dim font-normal text-xs ml-1.5">
                        {PROVIDER_LABEL[m.provider]}
                      </span>
                    </p>
                    <p className="text-text-dim text-xs mt-0.5">{m.hint}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-accent">
              <Sparkles size={22} />
            </div>
            <p className="text-text-dim text-sm max-w-xs">
              Pergunte qualquer coisa. Ele conhece o contexto do seu sistema.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-accent text-black'
                  : 'bg-surface border border-border'
              }`}
            >
              {m.content || (sending ? '···' : '')}
            </div>
          </div>
        ))}

        {error && <p className="text-danger text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua mensagem..."
          className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-sm
                     placeholder:text-text-dim outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-accent text-black px-4 disabled:opacity-40 transition-opacity"
          aria-label="Enviar"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
