import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, ChevronDown } from 'lucide-react'
import { AI_MODELS, DEFAULT_MODEL_ID, findModel } from '../../lib/models'
import { useChat } from '../../lib/useChat'
import HeroAvatar from '../../components/HeroAvatar'

export default function Assistant() {
  const [input, setInput] = useState('')
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { messages, sending, error, send } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Só desce quando já existe conversa. Sem esta guarda, a tela vazia rolava
    // sozinha ao abrir e escondia a fala da F.R.I.D.A.Y. lá em cima.
    if (messages.length === 0) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    await send(text, modelId)
  }

  const model = findModel(modelId)

  return (
    // A altura desconta cabeçalho, respiros e o balão do herói acima da tela.
    <div className="flex flex-col h-[calc(100svh-19rem)] min-h-[20rem]">
      {/* No celular o título e o seletor de herói se espremiam lado a lado;
          empilhar dá ar aos dois. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assistente</h1>
          <p className="text-text-dim text-sm mt-1">Seu esquadrão de IA</p>
        </div>

        <div className="relative shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-2.5 border border-border rounded-xl pl-2 pr-3 py-1.5
                       hover:border-accent transition-colors"
          >
            <HeroAvatar modelId={modelId} size={28} alive />
            <span className="text-sm font-medium">{model?.label}</span>
            <ChevronDown size={14} className="text-text-faint" />
          </button>

          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              {/* No celular o botão fica à esquerda, então ancorar pela direita
                  jogava o menu para fora da tela. Lá ele abre pela esquerda e
                  nunca passa da largura disponível. */}
              <div
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-20
                           w-[min(18rem,calc(100vw-2.5rem))] sm:w-72
                           bg-surface border border-border rounded-xl p-1 shadow-2xl"
              >
                {AI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModelId(m.id)
                      setPickerOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                      m.id === modelId ? 'bg-surface-2' : 'hover:bg-surface-2'
                    }`}
                  >
                    <HeroAvatar modelId={m.id} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className="text-[10px] text-text-faint">{m.realName}</span>
                      </span>
                      <span className="block text-xs text-text-dim mt-0.5">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <HeroAvatar modelId={modelId} size={104} alive />
            <div>
              <p className="font-semibold">{model?.label}</p>
              <p className="text-text-dim text-sm max-w-xs mt-1">
                {model?.hint}. Pergunte qualquer coisa — ele conhece o seu sistema.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`tjv-pop max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-surface border border-border-soft rounded-bl-sm'
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
                     placeholder:text-text-faint outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-accent text-white px-4 disabled:opacity-40
                     hover:bg-accent-light transition-all"
          aria-label="Enviar"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
