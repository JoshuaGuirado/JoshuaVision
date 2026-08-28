import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Plus, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useHeroVoice } from '../lib/heroVoice'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-text-dim text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * Botão de criar. Dentro de um módulo ele fala como o herói ("Forjar" com o
 * Thor, "Lançar teia" com o Aranha); fora, continua sendo "Novo".
 * Um `label` explícito sempre ganha.
 */
export function AddButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const voice = useHeroVoice()
  const texto = label ?? voice?.action ?? 'Novo'

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-semibold bg-accent text-black
                 rounded-xl px-3.5 py-2.5 hover:bg-accent-light transition-colors shrink-0"
    >
      <Plus size={16} strokeWidth={2.5} /> {texto}
    </button>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-surface border border-border-soft rounded-2xl hover:border-border
                  transition-colors ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Tela vazia. Dentro de um módulo quem avisa é o herói, com a frase dele;
 * `message` é a versão neutra usada fora dos módulos.
 */
export function EmptyState({
  icon: Icon = Inbox,
  message,
}: {
  icon?: LucideIcon
  message: string
}) {
  const voice = useHeroVoice()
  const texto = voice?.empty ?? message

  return (
    <div className="border border-dashed border-border rounded-2xl py-14 flex flex-col items-center gap-3 text-center">
      <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center text-text-faint">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <p className="text-text-dim text-sm max-w-[18rem]">{texto}</p>
      {voice && (
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ opacity: 0.55 }}>
          {voice.name}
        </p>
      )}
    </div>
  )
}

export function StateMessage({
  loading,
  error,
}: {
  loading: boolean
  error: string | null
}) {
  if (error) return <p className="text-danger text-sm mb-4">{error}</p>
  if (loading) return <p className="text-text-dim text-sm">Carregando...</p>
  return null
}

const fieldClass =
  'w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 text-sm ' +
  'placeholder:text-text-faint outline-none focus:border-accent transition-colors'

export function Field({
  label,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="text-xs text-text-dim mb-1.5 block">{label}</span>}
      <input {...props} className={fieldClass} />
    </label>
  )
}

export function TextArea({
  label,
  ...props
}: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="text-xs text-text-dim mb-1.5 block">{label}</span>}
      <textarea {...props} className={`${fieldClass} resize-y min-h-[5rem]`} />
    </label>
  )
}

export function Select({
  label,
  children,
  ...props
}: { label?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="text-xs text-text-dim mb-1.5 block">{label}</span>}
      <select {...props} className={fieldClass}>
        {children}
      </select>
    </label>
  )
}

export function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-xl bg-accent text-black font-semibold py-3
                 disabled:opacity-40 hover:bg-accent-light transition-all"
    >
      {children}
    </button>
  )
}

/** Barra de progresso usada por metas, projetos e estudos. */
export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}
