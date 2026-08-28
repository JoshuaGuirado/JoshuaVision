import { useEffect, useState } from 'react'
import { Plus, Trash2, Repeat } from 'lucide-react'
import Modal from '../../components/Modal'
import CategoryIcon from '../../components/CategoryIcon'
import { Field, MoneyField, Select, SubmitButton } from '../../components/ui'
import {
  createTransaction,
  deleteTransaction,
  fetchCategories,
  fetchTransactions,
} from '../../lib/data'
import type { Category, Transaction, TransactionType } from '../../lib/types'
import { formatMoney } from '../../lib/format'

export default function FinanceTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [tx, cats] = await Promise.all([fetchTransactions(), fetchCategories()])
      setTransactions(tx)
      setCategories(cats)
    } catch {
      setError('Não consegui carregar os dados. As tabelas já foram criadas no Supabase?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await deleteTransaction(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Lançamentos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-medium bg-accent text-black rounded-lg px-3 py-2"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      {loading && <p className="text-text-dim text-sm">Carregando...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && transactions.length === 0 && (
        <p className="text-text-dim text-sm">Nenhum lançamento ainda.</p>
      )}

      <div className="space-y-2">
        {transactions.map((t) => {
          const cat = t.category_id ? categoryById[t.category_id] : null
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: (cat?.color ?? '#9a9a9a') + '22',
                  color: cat?.color ?? '#9a9a9a',
                }}
              >
                <CategoryIcon name={cat?.icon ?? 'circle'} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-1.5">
                  {t.description || cat?.name || 'Sem descrição'}
                  {t.is_recurring && <Repeat size={12} className="text-text-dim shrink-0" />}
                </p>
                <p className="text-xs text-text-dim">
                  {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')} · {cat?.name ?? 'Sem categoria'}
                </p>
              </div>
              <span className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount)}
              </span>
              <button onClick={() => handleDelete(t.id)} className="text-text-dim hover:text-danger p-1">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {showForm && (
        <TransactionForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function TransactionForm({
  categories,
  onClose,
  onSaved,
}: {
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<TransactionType>('expense')
  // Valor em reais (12.34), não em texto: o campo de dinheiro já entrega número.
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isRecurring, setIsRecurring] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (amount <= 0) return
    setSaving(true)
    await createTransaction({
      type,
      amount,
      category_id: categoryId || null,
      description: description.trim(),
      date,
      is_recurring: isRecurring,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title="Novo lançamento" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium ${
                type === t ? 'bg-accent text-black' : 'text-text-dim'
              }`}
            >
              {t === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        <MoneyField autoFocus label="Valor" value={amount} onValue={setAmount} />

        <Field
          label="Descrição"
          placeholder="Com o que foi?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Categoria"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Field
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="flex items-center gap-2.5 text-sm text-text-dim cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Repete todo mês
        </label>

        <SubmitButton onClick={handleSubmit} disabled={saving || amount <= 0}>
          {saving ? 'Salvando...' : 'Salvar'}
        </SubmitButton>
      </div>
    </Modal>
  )
}
