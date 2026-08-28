import { useState, type FormEvent } from 'react'
import { Trash2, ListChecks, Check } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  Select,
  SubmitButton,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'

type Task = {
  id: string
  title: string
  done: boolean
  priority: 'baixa' | 'media' | 'alta'
  due_date: string | null
}

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  alta: '#e5484d',
  media: '#d4a53c',
  baixa: '#8b8d92',
}

export default function Tasks() {
  const { items, loading, error, create, update, remove } = useCollection<Task>('tasks', {
    column: 'created_at',
    ascending: false,
  })
  const [showForm, setShowForm] = useState(false)

  const pending = items.filter((t) => !t.done)
  const done = items.filter((t) => t.done)

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle={
          items.length > 0 ? `${pending.length} pendente${pending.length === 1 ? '' : 's'}` : undefined
        }
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={ListChecks} message="Nenhuma tarefa ainda. Adicione a primeira." />
      )}

      <div className="space-y-2">
        {pending.map((t) => (
          <TaskRow key={t.id} task={t} onToggle={update} onDelete={remove} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-text-faint mb-3">
            Concluídas ({done.length})
          </p>
          <div className="space-y-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={update} onDelete={remove} />
            ))}
          </div>
        </div>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} onCreate={create} />}
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: (id: string, values: Record<string, unknown>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <div className="group flex items-center gap-3 bg-surface border border-border-soft hover:border-border rounded-xl px-4 py-3 transition-colors">
      <button
        onClick={() => onToggle(task.id, { done: !task.done })}
        className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center transition-colors ${
          task.done ? 'bg-success border-success text-black' : 'border-border hover:border-accent'
        }`}
        aria-label={task.done ? 'Desmarcar' : 'Concluir'}
      >
        {task.done && <Check size={13} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${task.done ? 'line-through text-text-faint' : ''}`}>
          {task.title}
        </p>
        {task.due_date && (
          <p className="text-xs text-text-faint mt-0.5">
            {new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {!task.done && (
        <span
          className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-md shrink-0"
          style={{
            color: PRIORITY_COLOR[task.priority],
            backgroundColor: `${PRIORITY_COLOR[task.priority]}1a`,
          }}
        >
          {task.priority}
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="text-text-faint hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
        aria-label="Excluir"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function TaskForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('media')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onCreate({ title: title.trim(), priority, due_date: dueDate || null })
    setSaving(false)
    onClose()
  }

  return (
    <Modal title="Nova tarefa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="O que precisa ser feito?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select
          label="Prioridade"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </Select>
        <Field
          label="Prazo (opcional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <SubmitButton disabled={saving || !title.trim()}>
          {saving ? 'Salvando...' : 'Adicionar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
