import { useState, type FormEvent } from 'react'
import { Trash2, Target } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  TextArea,
  SubmitButton,
  ProgressBar,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'

type Goal = {
  id: string
  title: string
  notes: string
  progress: number
  deadline: string | null
}

const COLOR = '#e5484d'

export default function Goals() {
  const { items, loading, error, create, update, remove } = useCollection<Goal>('goals', {
    column: 'created_at',
    ascending: false,
  })
  const [showForm, setShowForm] = useState(false)

  const doneCount = items.filter((g) => g.progress >= 100).length

  return (
    <div>
      <PageHeader
        title="Metas"
        subtitle={items.length > 0 ? `${doneCount} de ${items.length} concluídas` : undefined}
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Target} message="Nenhuma meta ainda. Defina a primeira." />
      )}

      <div className="space-y-3">
        {items.map((g) => {
          const late = g.deadline && g.deadline < new Date().toISOString().slice(0, 10) && g.progress < 100
          return (
            <div
              key={g.id}
              className="group bg-surface border border-border-soft hover:border-border rounded-2xl p-4 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{g.title}</p>
                  {g.notes && <p className="text-text-dim text-xs mt-1">{g.notes}</p>}
                  {g.deadline && (
                    <p className={`text-xs mt-1.5 ${late ? 'text-danger' : 'text-text-faint'}`}>
                      {late ? 'Prazo vencido · ' : 'Até '}
                      {new Date(g.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: COLOR }}>
                  {g.progress}%
                </span>
                <button
                  onClick={() => remove(g.id)}
                  className="text-text-faint hover:text-danger transition-colors -m-1 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <ProgressBar value={g.progress} color={COLOR} />

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={g.progress}
                onChange={(e) => update(g.id, { progress: Number(e.target.value) })}
                className="w-full mt-3 accent-[#e5484d] cursor-pointer"
                aria-label={`Progresso de ${g.title}`}
              />
            </div>
          )
        })}
      </div>

      {showForm && (
        <GoalForm
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

function GoalForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onCreate({ title: title.trim(), notes: notes.trim(), deadline: deadline || null })
    setSaving(false)
  }

  return (
    <Modal title="Nova meta" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="O que você quer alcançar?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          label="Detalhes (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Field
          label="Prazo (opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <SubmitButton disabled={saving || !title.trim()}>
          {saving ? 'Salvando...' : 'Criar meta'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
