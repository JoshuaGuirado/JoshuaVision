import { useState, type FormEvent } from 'react'
import { Trash2, Calendar, Clock } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  TextArea,
  SubmitButton,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'

type EventItem = {
  id: string
  title: string
  notes: string
  date: string
  time: string | null
}

const todayISO = () => new Date().toISOString().slice(0, 10)

function formatDayLabel(date: string) {
  const d = new Date(date + 'T00:00:00')
  const today = todayISO()
  if (date === today) return 'Hoje'

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date === tomorrow.toISOString().slice(0, 10)) return 'Amanhã'

  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Agenda() {
  const { items, loading, error, create, remove } = useCollection<EventItem>('events', {
    column: 'date',
    ascending: true,
  })
  const [showForm, setShowForm] = useState(false)

  const today = todayISO()
  const upcoming = items.filter((e) => e.date >= today)
  const past = items.filter((e) => e.date < today).reverse()

  // Agrupa por dia para a lista ficar legível em vez de uma fila solta.
  const byDay = upcoming.reduce<Record<string, EventItem[]>>((acc, e) => {
    ;(acc[e.date] ??= []).push(e)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={upcoming.length > 0 ? `${upcoming.length} pela frente` : undefined}
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Calendar} message="Nada marcado. Adicione seu primeiro compromisso." />
      )}

      <div className="space-y-6">
        {Object.entries(byDay).map(([date, events]) => (
          <div key={date}>
            <p className="text-xs uppercase tracking-wide text-accent mb-2.5 font-medium">
              {formatDayLabel(date)}
            </p>
            <div className="space-y-2">
              {events
                .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
                .map((e) => (
                  <EventRow key={e.id} event={e} onDelete={remove} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <div className="mt-9">
          <p className="text-xs uppercase tracking-wide text-text-faint mb-2.5">Passados</p>
          <div className="space-y-2 opacity-55">
            {past.slice(0, 10).map((e) => (
              <EventRow key={e.id} event={e} onDelete={remove} />
            ))}
          </div>
        </div>
      )}

      {showForm && <EventForm onClose={() => setShowForm(false)} onCreate={create} />}
    </div>
  )
}

function EventRow({
  event,
  onDelete,
}: {
  event: EventItem
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <div className="group flex items-start gap-3 bg-surface border border-border-soft hover:border-border rounded-xl px-4 py-3 transition-colors">
      <div className="w-14 shrink-0 pt-0.5">
        {event.time ? (
          <span className="text-sm font-semibold tabular-nums">{event.time.slice(0, 5)}</span>
        ) : (
          <Clock size={15} className="text-text-faint" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        {event.notes && <p className="text-xs text-text-dim mt-0.5">{event.notes}</p>}
      </div>

      <button
        onClick={() => onDelete(event.id)}
        className="text-text-faint hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
        aria-label="Excluir"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function EventForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onCreate({ title: title.trim(), date, time: time || null, notes: notes.trim() })
    setSaving(false)
    onClose()
  }

  return (
    <Modal title="Novo compromisso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Field
            label="Hora (opcional)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <TextArea
          label="Observações (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <SubmitButton disabled={saving || !title.trim()}>
          {saving ? 'Salvando...' : 'Adicionar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
