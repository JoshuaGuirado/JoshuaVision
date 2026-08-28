import { useEffect, useState, type FormEvent } from 'react'
import { Trash2, Repeat, Check } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  SubmitButton,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'
import { supabase } from '../../lib/supabase'

type Habit = { id: string; name: string; color: string }
type HabitLog = { id: string; habit_id: string; date: string }

const PALETTE = ['#8e5bef', '#5b8def', '#46a758', '#d4a53c', '#ef5b9c', '#3bb7c4']

/** Os 7 dias terminando hoje, em ISO. */
function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default function Habits() {
  const { items, loading, error, create, remove } = useCollection<Habit>('habits', {
    column: 'created_at',
    ascending: true,
  })
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [showForm, setShowForm] = useState(false)

  const days = lastSevenDays()

  async function loadLogs() {
    const { data } = await supabase.from('habit_logs').select('*').gte('date', days[0])
    setLogs((data ?? []) as HabitLog[])
  }

  useEffect(() => {
    loadLogs()
    // Recarrega junto com os hábitos; days[0] muda só quando vira o dia.
  }, [items.length])

  const isDone = (habitId: string, date: string) =>
    logs.some((l) => l.habit_id === habitId && l.date === date)

  async function toggle(habitId: string, date: string) {
    const existing = logs.find((l) => l.habit_id === habitId && l.date === date)

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
    } else {
      const { data: userData } = await supabase.auth.getUser()
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, date, user_id: userData.user!.id })
    }
    await loadLogs()
  }

  const today = days[6]
  const doneToday = items.filter((h) => isDone(h.id, today)).length

  return (
    <div>
      <PageHeader
        title="Hábitos"
        subtitle={items.length > 0 ? `${doneToday}/${items.length} hoje` : undefined}
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Repeat} message="Nenhum hábito ainda. Crie o primeiro." />
      )}

      {items.length > 0 && (
        <div className="flex justify-end gap-1.5 mb-2 pr-9">
          {days.map((d) => (
            <span key={d} className="w-8 text-center text-[10px] text-text-faint uppercase">
              {new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' })}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {items.map((h) => (
          <div
            key={h.id}
            className="group flex items-center gap-3 bg-surface border border-border-soft
                       hover:border-border rounded-xl px-4 py-3 transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: h.color }}
            />
            <p className="text-sm font-medium flex-1 min-w-0 truncate">{h.name}</p>

            <div className="flex gap-1.5 shrink-0">
              {days.map((d) => {
                const done = isDone(h.id, d)
                return (
                  <button
                    key={d}
                    onClick={() => toggle(h.id, d)}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: done ? h.color : 'transparent',
                      borderColor: done ? h.color : 'var(--color-border)',
                      color: done ? '#000' : 'transparent',
                    }}
                    aria-label={`${h.name} em ${d}`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => remove(h.id)}
              className="text-text-faint hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100 shrink-0"
              aria-label="Excluir"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <HabitForm
          onClose={() => setShowForm(false)}
          onCreate={async (v) => {
            await create(v)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function HabitForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onCreate({ name: name.trim(), color })
    setSaving(false)
  }

  return (
    <Modal title="Novo hábito" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="Ex: Ler 20 minutos"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <span className="text-xs text-text-dim mb-2 block">Cor</span>
          <div className="flex gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  outline: color === c ? '2px solid #f0f0f1' : 'none',
                  outlineOffset: '2px',
                }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        <SubmitButton disabled={saving || !name.trim()}>
          {saving ? 'Salvando...' : 'Criar hábito'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
