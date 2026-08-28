import { useState, type FormEvent } from 'react'
import { Trash2, FolderKanban } from 'lucide-react'
import Modal from '../../components/Modal'
import {
  PageHeader,
  AddButton,
  EmptyState,
  StateMessage,
  Field,
  TextArea,
  Select,
  SubmitButton,
  ProgressBar,
} from '../../components/ui'
import { useCollection } from '../../lib/useCollection'

type Status = 'ideia' | 'ativo' | 'pausado' | 'concluido'

type Project = {
  id: string
  name: string
  notes: string
  status: Status
  progress: number
}

const STATUS_LABEL: Record<Status, string> = {
  ideia: 'Ideia',
  ativo: 'Ativo',
  pausado: 'Pausado',
  concluido: 'Concluído',
}

const STATUS_COLOR: Record<Status, string> = {
  ideia: '#8b8d92',
  ativo: '#ef8e5b',
  pausado: '#d4a53c',
  concluido: '#46a758',
}

export default function Projects() {
  const { items, loading, error, create, update, remove } = useCollection<Project>('projects', {
    column: 'created_at',
    ascending: false,
  })
  const [showForm, setShowForm] = useState(false)

  const active = items.filter((p) => p.status === 'ativo').length

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle={items.length > 0 ? `${active} ativo${active === 1 ? '' : 's'}` : undefined}
        action={<AddButton onClick={() => setShowForm(true)} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={FolderKanban} message="Nenhum projeto ainda. Comece o primeiro." />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((p) => (
          <div
            key={p.id}
            className="group bg-surface border border-border-soft hover:border-border rounded-2xl p-4 transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              <p className="font-semibold text-sm flex-1 min-w-0 truncate">{p.name}</p>
              <button
                onClick={() => remove(p.id)}
                className="text-text-faint hover:text-danger transition-colors -m-1 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                aria-label="Excluir"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {p.notes && <p className="text-text-dim text-xs mb-3 line-clamp-2">{p.notes}</p>}

            <div className="flex items-center gap-2 mb-3">
              <select
                value={p.status}
                onChange={(e) => update(p.id, { status: e.target.value })}
                className="text-[11px] uppercase tracking-wide rounded-md px-2 py-1 outline-none cursor-pointer border-0"
                style={{
                  color: STATUS_COLOR[p.status],
                  backgroundColor: `${STATUS_COLOR[p.status]}1a`,
                }}
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value} className="bg-surface-2 text-text">
                    {label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-text-faint tabular-nums ml-auto">{p.progress}%</span>
            </div>

            <ProgressBar value={p.progress} color={STATUS_COLOR[p.status]} />

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={p.progress}
              onChange={(e) => update(p.id, { progress: Number(e.target.value) })}
              className="w-full mt-2.5 accent-[#ef8e5b] cursor-pointer"
              aria-label={`Progresso de ${p.name}`}
            />
          </div>
        ))}
      </div>

      {showForm && (
        <ProjectForm
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

function ProjectForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, unknown>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<Status>('ativo')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onCreate({ name: name.trim(), notes: notes.trim(), status })
    setSaving(false)
  }

  return (
    <Modal title="Novo projeto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="Nome do projeto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextArea
          label="Descrição (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <SubmitButton disabled={saving || !name.trim()}>
          {saving ? 'Salvando...' : 'Criar projeto'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
