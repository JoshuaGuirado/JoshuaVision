import { useState, type FormEvent } from 'react'
import { Trash2, StickyNote } from 'lucide-react'
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

type Note = {
  id: string
  title: string
  content: string
  updated_at: string
}

export default function Notes() {
  const { items, loading, error, create, update, remove } = useCollection<Note>('notes', {
    column: 'updated_at',
    ascending: false,
  })
  const [editing, setEditing] = useState<Note | 'new' | null>(null)

  return (
    <div>
      <PageHeader
        title="Notas"
        subtitle={items.length > 0 ? `${items.length} nota${items.length === 1 ? '' : 's'}` : undefined}
        action={<AddButton onClick={() => setEditing('new')} />}
      />

      <StateMessage loading={loading} error={error} />

      {!loading && !error && items.length === 0 && (
        <EmptyState icon={StickyNote} message="Nenhuma nota ainda. Escreva a primeira." />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => setEditing(n)}
            className="group text-left bg-surface border border-border-soft hover:border-border
                       rounded-2xl p-4 transition-colors relative"
          >
            <p className="font-semibold text-sm pr-6 truncate">{n.title || 'Sem título'}</p>
            <p className="text-text-dim text-xs mt-1.5 line-clamp-3 whitespace-pre-wrap">
              {n.content || '—'}
            </p>
            <p className="text-text-faint text-[11px] mt-3">
              {new Date(n.updated_at).toLocaleDateString('pt-BR')}
            </p>

            <span
              onClick={(e) => {
                e.stopPropagation()
                remove(n.id)
              }}
              className="absolute top-3 right-3 text-text-faint hover:text-danger transition-colors
                         p-1 opacity-0 group-hover:opacity-100"
              aria-label="Excluir"
            >
              <Trash2 size={15} />
            </span>
          </button>
        ))}
      </div>

      {editing && (
        <NoteForm
          note={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            if (editing === 'new') await create(values)
            else await update(editing.id, { ...values, updated_at: new Date().toISOString() })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function NoteForm({
  note,
  onClose,
  onSave,
}: {
  note: Note | null
  onClose: () => void
  onSave: (values: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({ title: title.trim(), content })
    setSaving(false)
  }

  return (
    <Modal title={note ? 'Editar nota' : 'Nova nota'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          autoFocus
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          placeholder="Escreva aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={9}
        />
        <SubmitButton disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</SubmitButton>
      </form>
    </Modal>
  )
}
