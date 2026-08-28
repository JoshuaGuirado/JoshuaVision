import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X, Send, ChevronDown, Maximize2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AI_MODELS, DEFAULT_MODEL_ID, findModel } from '../lib/models'
import { useChat } from '../lib/useChat'
import HeroAvatar from './HeroAvatar'

/**
 * Bolha de suporte fixa no canto — o esquadrão fica sempre a um clique,
 * em qualquer tela do sistema.
 */
export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sending, error, send } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    await send(text, modelId)
  }

  const model = findModel(modelId)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="tjv-pulse fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full
                   shadow-2xl hover:scale-110 active:scale-95 transition-transform"
        aria-label="Abrir assistente"
      >
        <HeroAvatar modelId={modelId} size={56} alive />
      </button>
    )
  }

  return (
    <div
      className="tjv-pop fixed bottom-5 right-5 left-5 sm:left-auto z-40 sm:w-[23rem]
                 h-[30rem] max-h-[75svh] bg-surface border border-border rounded-2xl
                 shadow-2xl flex flex-col overflow-hidden"
    >
      <header className="flex items-center gap-2.5 px-4 py-3 border-b border-border-soft shrink-0">
        <HeroAvatar modelId={modelId} size={30} alive />

        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-1 text-left min-w-0 group"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold truncate group-hover:text-accent transition-colors">
                {model?.label}
              </span>
              <span className="block text-[10px] text-text-faint truncate">{model?.realName}</span>
            </span>
            <ChevronDown size={14} className="text-text-faint shrink-0" />
          </button>

          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-64 bg-surface-2 border border-border rounded-xl p-1 z-20 shadow-2xl">
                {AI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModelId(m.id)
                      setPickerOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                      m.id === modelId ? 'bg-surface-3' : 'hover:bg-surface-3'
                    }`}
                  >
                    <HeroAvatar modelId={m.id} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{m.label}</span>
                      <span className="block text-[11px] text-text-faint truncate">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Link
          to="/assistente"
          onClick={() => setOpen(false)}
          className="text-text-faint hover:text-text transition-colors p-1"
          aria-label="Abrir em tela cheia"
        >
          <Maximize2 size={15} />
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="text-text-faint hover:text-text transition-colors p-1"
          aria-label="Fechar"
        >
          <X size={17} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <HeroAvatar modelId={modelId} size={64} alive />
            <p className="text-text-dim text-sm max-w-[15rem]">
              <span className="text-text font-medium">{model?.label}</span> está pronto.
              <br />O que você precisa?
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`tjv-pop max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-surface-2 border border-border-soft rounded-bl-sm'
              }`}
            >
              {m.content || (sending ? '···' : '')}
            </div>
          </div>
        ))}

        {error && <p className="text-danger text-xs">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border-soft shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva aqui..."
          className="flex-1 rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 text-sm
                     placeholder:text-text-faint outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-accent text-white px-3.5 disabled:opacity-40
                     hover:bg-accent-light transition-all"
          aria-label="Enviar"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
