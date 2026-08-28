import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ListChecks, Target, Wallet, Repeat, FolderKanban, ArrowRight } from 'lucide-react'
import { HOME_MODULES } from '../lib/nav'
import { fetchTransactions } from '../lib/data'
import { currentMonthRange, formatMoney } from '../lib/format'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning, Joshua.'
  if (hour < 18) return 'Good afternoon, Joshua.'
  return 'Good evening, Joshua.'
}

export default function Home() {
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
      .then((tx) => {
        const { start, end } = currentMonthRange()
        const monthTx = tx.filter((t) => t.date >= start && t.date <= end)
        const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        setBalance(formatMoney(income - expense))
      })
      .catch(() => setBalance(null))
  }, [])

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const todayStats = [
    { label: 'Próximos compromissos', value: '2 hoje', icon: Calendar, to: '/agenda' },
    { label: 'Tarefas pendentes', value: '3 pendentes', icon: ListChecks, to: '/tarefas' },
    { label: 'Progresso das metas', value: '2 de 5 em dia', icon: Target, to: '/metas' },
    { label: 'Saldo financeiro', value: balance ?? '—', icon: Wallet, to: '/financas' },
    { label: 'Hábitos do dia', value: '3/5 concluídos', icon: Repeat, to: '/habitos' },
    { label: 'Projetos em andamento', value: '2 ativos', icon: FolderKanban, to: '/projetos' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{greeting()}</h1>
        <p className="text-text-dim text-sm capitalize mt-1">{dateLabel}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-text-dim mb-3 uppercase tracking-wide">Hoje</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {todayStats.map(({ label, value, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-accent/40 transition-colors"
            >
              <Icon size={16} className="text-accent mb-3" />
              <p className="text-base font-bold">{value}</p>
              <p className="text-text-dim text-xs mt-0.5">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-dim mb-3 uppercase tracking-wide">Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HOME_MODULES.map(({ path, label, icon: Icon, description, implemented }) => (
            <Link
              key={path}
              to={path}
              className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-accent">
                  <Icon size={18} />
                </div>
                {!implemented && (
                  <span className="text-[10px] uppercase tracking-wide text-text-dim border border-border rounded-full px-2 py-1">
                    Em breve
                  </span>
                )}
              </div>
              <p className="font-semibold flex items-center gap-1.5">
                {label}
                <ArrowRight
                  size={14}
                  className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </p>
              <p className="text-text-dim text-sm mt-1">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
