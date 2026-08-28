import { useEffect, useState } from 'react'
import CategoryIcon from '../components/CategoryIcon'
import { fetchCategories, fetchTransactions } from '../lib/data'
import type { Category, Transaction } from '../lib/types'
import { currentMonthRange, formatMoney } from '../lib/format'

export default function Budget() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchTransactions()])
      .then(([cats, tx]) => {
        setCategories(cats)
        setTransactions(tx)
      })
      .catch(() => setError('Não consegui carregar os dados. As tabelas já foram criadas no Supabase?'))
      .finally(() => setLoading(false))
  }, [])

  const { start, end } = currentMonthRange()
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date >= start && t.date <= end,
  )

  const withBudget = categories.filter((c) => c.monthly_budget != null)
  const withoutBudget = categories.filter((c) => c.monthly_budget == null)

  function spentFor(categoryId: string) {
    return monthExpenses
      .filter((t) => t.category_id === categoryId)
      .reduce((s, t) => s + t.amount, 0)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orçamento do mês</h1>

      {loading && <p className="text-text-dim text-sm">Carregando...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && withBudget.length === 0 && (
        <p className="text-text-dim text-sm">
          Nenhuma categoria com orçamento definido. Configure um orçamento mensal em Categorias.
        </p>
      )}

      <div className="space-y-3">
        {withBudget.map((c) => {
          const spent = spentFor(c.id)
          const budget = c.monthly_budget!
          const pct = Math.min((spent / budget) * 100, 100)
          const over = spent > budget

          return (
            <div key={c.id} className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.color + '22', color: c.color }}
                >
                  <CategoryIcon name={c.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-text-dim">
                    {formatMoney(spent)} de {formatMoney(budget)}
                  </p>
                </div>
                {over && <span className="text-xs font-semibold text-danger">Estourou</span>}
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : c.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {!loading && !error && withoutBudget.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-dim mb-2">Sem orçamento definido</h2>
          <div className="space-y-2">
            {withoutBudget.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
              >
                <span className="text-sm">{c.name}</span>
                <span className="text-sm text-text-dim">{formatMoney(spentFor(c.id))} gastos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
