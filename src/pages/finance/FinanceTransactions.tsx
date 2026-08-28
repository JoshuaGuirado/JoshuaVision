import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2, Repeat, Search, SlidersHorizontal, X } from 'lucide-react'
import Modal from '../../components/Modal'
import CategoryIcon from '../../components/CategoryIcon'
import { Field, MoneyField, Select, SubmitButton, StateMessage } from '../../components/ui'
import { createTransaction, deleteTransaction } from '../../lib/data'
import { agruparPorDia, rotuloDoDia, useFinancas, CORES } from '../../lib/financas'
import type { Transaction, TransactionType } from '../../lib/types'
import { formatMoney } from '../../lib/format'

/**
 * LANÇAMENTOS DO MÊS.
 *
 * A lista é agrupada por dia, com o total de cada dia à direita — é assim que
 * se procura um gasto ("foi na terça"), e não rolando uma lista corrida.
 *
 * Os filtros ficam escondidos atrás de um botão: quem abre esta tela quase
 * sempre quer ver tudo, e uma fileira de filtros sempre aberta só ocupa a
 * primeira dobra do celular.
 */
export default function FinanceTransactions() {
  const financas = useFinancas()
  const { doMes, categorias, contas, carregando, erro, recarregar, rotuloDoMes } = financas

  const [criando, setCriando] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<'todos' | TransactionType>('todos')
  const [categoria, setCategoria] = useState('todas')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return doMes.filter((t) => {
      if (tipo !== 'todos' && t.type !== tipo) return false
      if (categoria !== 'todas' && (t.category_id ?? 'sem') !== categoria) return false
      if (termo && !t.description.toLowerCase().includes(termo)) return false
      return true
    })
  }, [doMes, tipo, categoria, busca])

  const filtrando = tipo !== 'todos' || categoria !== 'todas' || busca.trim() !== ''
  const dias = agruparPorDia(filtrados)
  const total = filtrados.reduce(
    (s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
    0,
  )

  return (
    <div>
      {/* ---- Botão de adicionar, em destaque ---- */}
      <button
        onClick={() => setCriando(true)}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent
                   text-white font-semibold py-3.5 mb-4 hover:bg-accent-light
                   active:scale-[0.99] transition-all"
      >
        <Plus size={19} strokeWidth={2.5} /> Adicionar lançamento
      </button>

      {/* ---- Barra de busca e filtros ---- */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center rounded-xl bg-surface-2 border border-border
                        focus-within:border-accent transition-colors">
          <Search size={15} className="ml-3 text-text-faint shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar..."
            className="w-full bg-transparent px-2.5 py-2.5 text-sm outline-none
                       placeholder:text-text-faint"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="px-2.5 text-text-faint hover:text-text">
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltrosAbertos((v) => !v)}
          aria-label="Filtros"
          className="w-11 shrink-0 rounded-xl border transition-colors flex items-center justify-center"
          style={{
            borderColor: filtrosAbertos || filtrando ? 'var(--color-accent)' : 'var(--color-border)',
            color: filtrosAbertos || filtrando ? 'var(--color-accent)' : 'var(--color-text-dim)',
          }}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {filtrosAbertos && (
        <div className="tjv-pop grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl border border-border-soft bg-surface">
          <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
            <option value="todos">Tudo</option>
            <option value="expense">Só saídas</option>
            <option value="income">Só entradas</option>
          </Select>
          <Select
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="sem">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          {filtrando && (
            <button
              onClick={() => {
                setTipo('todos')
                setCategoria('todas')
                setBusca('')
              }}
              className="col-span-2 text-xs text-text-dim hover:text-accent transition-colors py-1"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <StateMessage loading={carregando} error={erro} />

      {/* ---- Total do que está sendo mostrado ---- */}
      {filtrados.length > 0 && (
        <div className="flex items-baseline justify-between mb-3 px-1">
          <span className="text-xs text-text-dim">
            {filtrados.length} lançamento{filtrados.length === 1 ? '' : 's'}
            {filtrando ? ' (filtrado)' : ''}
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: total >= 0 ? CORES.entrada : CORES.saida }}
          >
            {total >= 0 ? '+' : '−'} {formatMoney(Math.abs(total))}
          </span>
        </div>
      )}

      {!carregando && !erro && filtrados.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl py-12 text-center">
          <p className="text-text-dim text-sm">
            {filtrando
              ? 'Nada encontrado com esses filtros.'
              : `Nenhum lançamento em ${rotuloDoMes}.`}
          </p>
        </div>
      )}

      {/* ---- A lista, dia a dia ---- */}
      <div className="space-y-5">
        {dias.map(([data, lista]) => {
          const totalDoDia = lista.reduce(
            (s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
            0,
          )
          return (
            <div key={data}>
              <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
                <h3 className="text-xs font-semibold text-text-dim first-letter:uppercase truncate">
                  {rotuloDoDia(data)}
                </h3>
                <span className="text-xs text-text-faint tabular-nums shrink-0">
                  {totalDoDia >= 0 ? '+' : '−'} {formatMoney(Math.abs(totalDoDia))}
                </span>
              </div>

              <div className="space-y-1.5">
                {lista.map((t) => (
                  <Linha
                    key={t.id}
                    lancamento={t}
                    categoria={categorias.find((c) => c.id === t.category_id)}
                    conta={contas.find((c) => c.id === t.account_id)?.name}
                    aoExcluir={async () => {
                      await deleteTransaction(t.id)
                      await recarregar()
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {criando && (
        <FormularioLancamento
          onClose={() => setCriando(false)}
          onSaved={async () => {
            setCriando(false)
            await recarregar()
          }}
        />
      )}
    </div>
  )
}

/** Uma linha da lista. */
function Linha({
  lancamento: t,
  categoria,
  conta,
  aoExcluir,
}: {
  lancamento: Transaction
  categoria?: { name: string; icon: string; color: string }
  conta?: string
  aoExcluir: () => Promise<void>
}) {
  const entrada = t.type === 'income'

  return (
    <div className="group flex items-center gap-3 bg-surface border border-border-soft
                    hover:border-border rounded-xl px-3.5 py-3 transition-colors">
      <span
        className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${categoria?.color ?? '#6b7280'}22` }}
      >
        <CategoryIcon name={categoria?.icon ?? 'circle'} size={16} color={categoria?.color ?? '#9aa0af'} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{t.description || categoria?.name || 'Sem descrição'}</p>
        <p className="text-[11px] text-text-faint truncate flex items-center gap-1.5">
          {categoria?.name ?? 'Sem categoria'}
          {conta && <span>· {conta}</span>}
          {t.is_recurring && <Repeat size={10} />}
        </p>
      </div>

      <span
        className="text-sm font-semibold tabular-nums shrink-0"
        style={{ color: entrada ? CORES.entrada : CORES.saida }}
      >
        {entrada ? '+' : '−'} {formatMoney(Number(t.amount))}
      </span>

      <button
        onClick={aoExcluir}
        className="text-text-faint hover:text-danger transition-colors p-1 shrink-0
                   opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Excluir"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

/** Formulário de novo lançamento. */
function FormularioLancamento({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const { categorias, contas } = useFinancas()

  const [type, setType] = useState<TransactionType>('expense')
  // Valor em reais (12.34), não em texto: o campo de dinheiro já entrega número.
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [isRecurring, setIsRecurring] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (amount <= 0 || salvando) return
    setSalvando(true)
    setErro(null)
    try {
      await createTransaction({
        type,
        amount,
        category_id: categoryId || null,
        account_id: accountId || null,
        description: description.trim(),
        date,
        is_recurring: isRecurring,
      })
      await onSaved()
    } catch {
      setErro('Não consegui salvar. Tente de novo.')
      setSalvando(false)
    }
  }

  return (
    <Modal title="Novo lançamento" onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as TransactionType[]).map((t) => {
            const ativo = type === t
            const cor = t === 'income' ? CORES.entrada : CORES.saida
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="rounded-xl border py-2.5 text-sm font-semibold transition-colors"
                style={{
                  color: ativo ? '#fff' : 'var(--color-text-dim)',
                  backgroundColor: ativo ? cor : 'transparent',
                  borderColor: ativo ? cor : 'var(--color-border)',
                }}
              >
                {t === 'expense' ? 'Saída' : 'Entrada'}
              </button>
            )
          })}
        </div>

        <MoneyField autoFocus label="Valor" value={amount} onValue={setAmount} />

        <Field
          label="Descrição"
          placeholder="Com o que foi?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {/* A conta só aparece se ele já tiver cadastrado alguma: sem contas,
            este campo seria um seletor vazio sem explicação. */}
        {contas.length > 0 && (
          <Select label="Conta" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Não informar</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        <Field label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label className="flex items-center gap-2.5 text-sm text-text-dim cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Repete todo mês
        </label>

        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando || amount <= 0}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
