import { useState, type FormEvent } from 'react'
import { Plus, ListChecks, StickyNote, Wallet } from 'lucide-react'
import Modal from './Modal'
import { Field, Select, SubmitButton } from './ui'
import { supabase } from '../lib/supabase'
import { useFx } from '../lib/fx'

/**
 * ADICIONAR DE QUALQUER TELA.
 *
 * Antes, para anotar uma tarefa o Joshua tinha que ir até a Home, entrar no
 * módulo e só então abrir o formulário. Estes são os três atalhos que ele mais
 * usa — tarefa, nota e lançamento — disponíveis de qualquer lugar do site.
 *
 * Escreve direto no Supabase em vez de passar pelo `useCollection`: aqui não
 * existe lista para recarregar, é só criar e sair.
 */
type Tipo = 'tarefa' | 'nota' | 'gasto'

const ABAS: { id: Tipo; rotulo: string; icone: typeof Plus; cor: string; bang: string }[] = [
  { id: 'tarefa', rotulo: 'Tarefa', icone: ListChecks, cor: '#f0a92c', bang: 'BLAM!' },
  { id: 'nota', rotulo: 'Nota', icone: StickyNote, cor: '#f5c33b', bang: 'ZAP!' },
  { id: 'gasto', rotulo: 'Gasto', icone: Wallet, cor: '#ec1d24', bang: 'CLANG!' },
]

export default function QuickAdd() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Adicionar rápido"
        className="fixed bottom-[5.5rem] right-5 z-40 w-12 h-12 rounded-full
                   bg-surface-2 border border-border text-text
                   flex items-center justify-center shadow-xl
                   hover:border-accent hover:text-accent transition-colors"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {aberto && <QuickAddModal onClose={() => setAberto(false)} />}
    </>
  )
}

function QuickAddModal({ onClose }: { onClose: () => void }) {
  const fx = useFx()
  const [tipo, setTipo] = useState<Tipo>('tarefa')
  const [texto, setTexto] = useState('')
  const [valor, setValor] = useState('')
  const [natureza, setNatureza] = useState<'expense' | 'income'>('expense')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const aba = ABAS.find((a) => a.id === tipo)!
  const valido = tipo === 'gasto' ? Number(valor) > 0 : texto.trim().length > 0

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!valido || salvando) return
    setSalvando(true)
    setErro(null)

    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      setErro('Sua sessão expirou. Entre de novo para salvar.')
      setSalvando(false)
      return
    }
    const user_id = data.user.id

    const destino =
      tipo === 'tarefa'
        ? supabase.from('tasks').insert({ user_id, title: texto.trim() })
        : tipo === 'nota'
          ? supabase.from('notes').insert({ user_id, title: texto.trim(), content: '' })
          : supabase.from('transactions').insert({
              user_id,
              type: natureza,
              amount: Number(valor),
              description: texto.trim(),
            })

    const { error } = await destino
    setSalvando(false)
    if (error) {
      setErro('Não consegui salvar. Tente de novo.')
      return
    }
    fx.bang(aba.bang, aba.cor, tipo === 'gasto' ? 'shield' : 'tech')
    onClose()
  }

  return (
    <Modal title="Adicionar rápido" onClose={onClose}>
      <div className="flex gap-1.5 mb-4">
        {ABAS.map(({ id, rotulo, icone: Icone, cor }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTipo(id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border
                       py-2.5 text-xs font-semibold transition-colors"
            style={{
              color: tipo === id ? cor : 'var(--color-text-dim)',
              borderColor: tipo === id ? cor : 'var(--color-border-soft)',
              backgroundColor: tipo === id ? `${cor}14` : 'transparent',
            }}
          >
            <Icone size={14} /> {rotulo}
          </button>
        ))}
      </div>

      <form onSubmit={salvar} className="space-y-4">
        <Field
          autoFocus
          placeholder={
            tipo === 'tarefa'
              ? 'O que precisa ser feito?'
              : tipo === 'nota'
                ? 'Título da nota'
                : 'Com o que foi? (opcional)'
          }
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        {tipo === 'gasto' && (
          <>
            <Select
              label="Tipo"
              value={natureza}
              onChange={(e) => setNatureza(e.target.value as 'expense' | 'income')}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </Select>
            <Field
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </>
        )}

        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando || !valido}>
          {salvando ? 'Salvando...' : 'Adicionar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
