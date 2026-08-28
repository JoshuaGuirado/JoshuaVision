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

/**
 * CAMPO DE DINHEIRO, JÁ EM REAIS.
 *
 * O campo antigo era um `number` cru: aparecia "0" solto, aceitava ponto e
 * vírgula misturados e não parecia dinheiro. Aqui o "R$" fica fixo à esquerda
 * e o valor se formata sozinho enquanto o Joshua digita — ele só aperta os
 * números e o 1234 vira "12,34".
 *
 * `value` é o valor em reais (ex: 12.34); `onValue` devolve o número.
 */
export function MoneyField({
  label,
  value,
  onValue,
  autoFocus,
  placeholder = '0,00',
}: {
  label?: string
  value: number
  onValue: (v: number) => void
  autoFocus?: boolean
  placeholder?: string
}) {
  // Guardamos os centavos como inteiro: contas com float em dinheiro erram
  // (0.1 + 0.2 não dá 0.3), e o teclado numérico do celular só manda dígitos.
  const centavos = Math.round(value * 100)
  const texto = centavos ? (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''

  return (
    <label className="block">
      {label && <span className="text-xs text-text-dim mb-1.5 block">{label}</span>}
      <div
        className="flex items-center rounded-xl bg-surface-2 border border-border
                   focus-within:border-accent transition-colors"
      >
        <span className="pl-3.5 pr-2 text-sm text-text-dim select-none">R$</span>
        <input
          autoFocus={autoFocus}
          // `inputMode` abre o teclado numérico no celular sem virar um campo
          // `number` (que traz as setinhas e aceita "e", "+", "-").
          inputMode="numeric"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => {
            const digitos = e.target.value.replace(/\D/g, '').slice(0, 11)
            onValue(digitos ? Number(digitos) / 100 : 0)
          }}
          className="w-full bg-transparent py-2.5 pr-3.5 text-sm outline-none
                     placeholder:text-text-faint"
        />
      </div>
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

/**
 * Botão de salvar. Sem `onClick` ele envia o formulário em volta; com
 * `onClick` vira um botão comum, para telas que salvam sem `<form>`.
 */
export function SubmitButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
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
