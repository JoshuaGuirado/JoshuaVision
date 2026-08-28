import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ListChecks, Repeat, Wallet, ChevronRight, Check } from 'lucide-react'
import { PageHeader, Card } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { formatMoney, currentMonthRange } from '../../lib/format'

type Summary = {
  events: { id: string; title: string; time: string | null }[]
  tasks: { id: string; title: string }[]
  habitsDone: number
  habitsTotal: number
  balance: number | null
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Today() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const today = todayISO()
    const { start, end } = currentMonthRange()

    Promise.all([
      supabase.from('events').select('id,title,time').eq('date', today).order('time'),
      supabase.from('tasks').select('id,title').eq('done', false).order('created_at'),
      supabase.from('habits').select('id'),
      supabase.from('habit_logs').select('habit_id').eq('date', today),
      supabase.from('transactions').select('type,amount').gte('date', start).lte('date', end),
    ])
      .then(([ev, tk, hb, hl, tx]) => {
        if (ev.error || tk.error) {
          setError(true)
          return
        }

        const income = (tx.data ?? [])
          .filter((t) => t.type === 'income')
          .reduce((s, t) => s + Number(t.amount), 0)
        const expense = (tx.data ?? [])
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + Number(t.amount), 0)

        setData({
          events: ev.data ?? [],
          tasks: tk.data ?? [],
          habitsDone: (hl.data ?? []).length,
          habitsTotal: (hb.data ?? []).length,
          balance: tx.error ? null : income - expense,
        })
      })
      .catch(() => setError(true))
  }, [])

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div>
      <PageHeader title="Hoje" subtitle={dateLabel} />

      {error && <p className="text-danger text-sm">Não consegui carregar o resumo.</p>}

      {!data && !error && <p className="text-text-dim text-sm">Carregando...</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              to="/tarefas"
              icon={ListChecks}
              color="#5b93ff"
              value={`${data.tasks.length}`}
              label={data.tasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
            />
            <StatCard
              to="/habitos"
              icon={Repeat}
              color="#2f6df0"
              value={`${data.habitsDone}/${data.habitsTotal}`}
              label="hábitos hoje"
            />
          </div>

          <SummaryList
            to="/agenda"
            icon={Calendar}
            color="#2f6df0"
            title="Compromissos de hoje"
            empty="Nada marcado para hoje."
            items={data.events.map((e) => ({
              id: e.id,
              text: e.title,
              meta: e.time ? e.time.slice(0, 5) : null,
            }))}
          />

          <SummaryList
            to="/tarefas"
            icon={ListChecks}
            color="#5b93ff"
            title="Tarefas pendentes"
            empty="Tudo em dia. 🎯"
            items={data.tasks.slice(0, 5).map((t) => ({ id: t.id, text: t.title, meta: null }))}
          />

          {data.balance != null && (
            <Link to="/financas" className="block">
              <Card className="p-5 flex items-center gap-4 hover:border-border transition-colors">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#a8bbdd1f', color: '#a8bbdd' }}
                >
                  <Wallet size={19} strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-dim">Saldo do mês</p>
                  <p
                    className={`text-lg font-bold ${
                      data.balance >= 0 ? 'text-text' : 'text-danger'
                    }`}
                  >
                    {formatMoney(data.balance)}
                  </p>
                </div>
                <ChevronRight size={18} className="text-text-faint shrink-0" />
              </Card>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  to,
  icon: Icon,
  color,
  value,
  label,
}: {
  to: string
  icon: typeof ListChecks
  color: string
  value: string
  label: string
}) {
  return (
    <Link
      to={to}
      className="tjv-rise bg-surface border border-border-soft hover:border-border rounded-2xl p-4 transition-colors block"
    >
      <span
        className="inline-flex w-9 h-9 rounded-lg items-center justify-center mb-3"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon size={17} strokeWidth={1.75} />
      </span>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-text-faint text-xs mt-0.5">{label}</p>
    </Link>
  )
}

function SummaryList({
  to,
  icon: Icon,
  color,
  title,
  empty,
  items,
}: {
  to: string
  icon: typeof Calendar
  color: string
  title: string
  empty: string
  items: { id: string; text: string; meta: string | null }[]
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <p className="text-sm font-semibold flex-1">{title}</p>
        {/* O padding dá área de toque ao ícone, que sozinho tinha 17px — pequeno
            demais para acertar com o dedo. O margin negativo mantém o alinhamento. */}
        <Link
          to={to}
          aria-label={`Abrir ${title}`}
          className="text-text-faint hover:text-text transition-colors -m-2 p-2"
        >
          <ChevronRight size={17} />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-text-faint text-sm flex items-center gap-1.5">
          <Check size={14} /> {empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-sm">
              <span className="w-1 h-1 rounded-full bg-text-faint shrink-0" />
              <span className="flex-1 min-w-0 truncate">{i.text}</span>
              {i.meta && (
                <span className="text-text-faint text-xs tabular-nums shrink-0">{i.meta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
