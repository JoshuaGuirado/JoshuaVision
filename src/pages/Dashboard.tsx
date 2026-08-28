import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { fetchTransactions } from '../lib/data'
import type { Transaction } from '../lib/types'
import { currentMonthRange, formatMoney } from '../lib/format'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions().then((tx) => {
      setTransactions(tx)
      setLoading(false)
    })
  }, [])

  const { start, end } = currentMonthRange()
  const monthTx = transactions.filter((t) => t.date >= start && t.date <= end)
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Olá, Joshua</h1>
        <p className="text-text-dim text-sm capitalize">{monthLabel}</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 text-text-dim text-sm mb-1">
          <Wallet size={16} /> Saldo do mês
        </div>
        <p className={`text-3xl font-extrabold ${balance >= 0 ? 'text-text' : 'text-danger'}`}>
          {loading ? '···' : formatMoney(balance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-success text-sm mb-1">
            <TrendingUp size={16} /> Receitas
          </div>
          <p className="text-lg font-bold">{loading ? '···' : formatMoney(income)}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-danger text-sm mb-1">
            <TrendingDown size={16} /> Despesas
          </div>
          <p className="text-lg font-bold">{loading ? '···' : formatMoney(expense)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-dim mb-2">Últimos lançamentos</h2>
        {!loading && monthTx.length === 0 && (
          <p className="text-text-dim text-sm">Nada lançado este mês ainda.</p>
        )}
        <div className="space-y-2">
          {monthTx.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
            >
              <span className="text-sm truncate">{t.description || 'Sem descrição'}</span>
              <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
