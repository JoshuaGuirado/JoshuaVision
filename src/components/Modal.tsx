import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Quantos formulários estão abertos agora.
 *
 * Serve para a bolha do assistente sair da frente: ela é fixa no canto e
 * ficava por cima do botão de salvar de qualquer formulário.
 */
let abertos = 0
const ouvintes = new Set<() => void>()

function avisar() {
  ouvintes.forEach((o) => o())
}

/** `true` enquanto houver algum formulário aberto na tela. */
export function useTemModalAberto() {
  return useSyncExternalStore(
    (ouvir) => {
      ouvintes.add(ouvir)
      return () => ouvintes.delete(ouvir)
    },
    () => abertos > 0,
    () => false,
  )
}

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    abertos++
    avisar()
    return () => {
      abertos--
      avisar()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-surface border border-border rounded-t-2xl sm:rounded-2xl p-5 max-h-[85svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
