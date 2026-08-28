import { useState, type FormEvent } from 'react'
import { Trash2, GraduationCap } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  SubmitButton,
  ProgressBar,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'

type Study = {
  id: string
  subject: string
  topic: string
  progress: number
  hours: number
}

const COLOR = '#3bb7c4'

export default function Studies() {
  const { items, loading, error, create, update, remove } = useCollection<Study>('studies', {
    column: 'created_at',
    ascending: false,
  })
  const [showForm, setShowForm] = useState(false)

  const totalHours = items.reduce((sum, s) => sum + Number(s.hours), 0)

  return (
    <div>
      <PageHeader
        title="Estudos"
        subtitle={items.length > 0 ? `${totalHours.toFixed(1)}h acumuladas` : undefined}
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={GraduationCap} message="Nenhuma matéria ainda. Adicione a primeira." />
      )}

      <div className="space-y-3">
        {items.map((s) => (
          <div
            key={s.id}
            className="group bg-surface border border-border-soft hover:border-border rounded-2xl p-4 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{s.subject}</p>
                {s.topic && <p className="text-text-dim text-xs mt-0.5">{s.topic}</p>}
              </div>
              <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: COLOR }}>
                {s.progress}%
              </span>
              <button
                onClick={() => remove(s.id)}
                className="text-text-faint hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
                aria-label="Excluir"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <ProgressBar value={s.progress} color={COLOR} />

            <div className="flex items-center gap-3 mt-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={s.progress}
                onChange={(e) => update(s.id, { progress: Number(e.target.value) })}
                className="flex-1 accent-[#3bb7c4] cursor-pointer"
                aria-label={`Progresso de ${s.subject}`}
              />
              <label className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={s.hours}
                  onChange={(e) => update(s.id, { hours: Number(e.target.value) })}
                  className="w-16 rounded-lg bg-surface-2 border border-border px-2 py-1 text-xs
                             text-right outline-none focus:border-accent transition-colors"
                  aria-label="Horas estudadas"
                />
                <span className="text-xs text-text-faint">h</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <StudyForm
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

function StudyForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    setSaving(true)
    await onCreate({ subject: subject.trim(), topic: topic.trim() })
    setSaving(false)
  }

  return (
    <Modal title="Nova matéria" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="Matéria (ex: Cálculo I)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Field
          label="Tópico atual (opcional)"
          placeholder="Ex: Derivadas"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <SubmitButton disabled={saving || !subject.trim()}>
          {saving ? 'Salvando...' : 'Adicionar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
