import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import Modal from '../components/Modal'
import CategoryIcon, { CATEGORY_ICON_NAMES } from '../components/CategoryIcon'
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../lib/data'
import type { Category } from '../lib/types'
import { formatMoney } from '../lib/format'

const COLORS = ['#f5c518', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#14b8a6']

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  async function load() {
    setLoading(true)
    setCategories(await fetchCategories())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria?')) return
    await deleteCategory(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Categorias</h1>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-1 text-sm font-medium bg-accent text-black rounded-lg px-3 py-2"
        >
          <Plus size={16} /> Nova
        </button>
      </div>

      {loading && <p className="text-text-dim text-sm">Carregando...</p>}
      {!loading && categories.length === 0 && (
        <p className="text-text-dim text-sm">Nenhuma categoria ainda. Crie a primeira.</p>
      )}

      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: c.color + '22', color: c.color }}
            >
              <CategoryIcon name={c.icon} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.name}</p>
              {c.monthly_budget != null && (
                <p className="text-xs text-text-dim">Orçamento: {formatMoney(c.monthly_budget)}</p>
              )}
            </div>
            <button onClick={() => setEditing(c)} className="text-text-dim hover:text-text p-1">
              <Pencil size={16} />
            </button>
            <button onClick={() => handleDelete(c.id)} className="text-text-dim hover:text-danger p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICON_NAMES[0])
  const [color, setColor] = useState(category?.color ?? COLORS[0])
  const [budget, setBudget] = useState(category?.monthly_budget?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    const payload = {
      name: name.trim(),
      icon,
      color,
      monthly_budget: budget ? Number(budget) : null,
    }
    if (category) await updateCategory(category.id, payload)
    else await createCategory(payload)
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title={category ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <div className="space-y-4">
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 outline-none focus:border-accent"
        />

        <div>
          <p className="text-xs text-text-dim mb-2">Ícone</p>
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_ICON_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => setIcon(n)}
                className={`aspect-square rounded-lg flex items-center justify-center border ${
                  icon === n ? 'border-accent bg-accent/10' : 'border-border'
                }`}
              >
                <CategoryIcon name={n} size={18} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-text-dim mb-2">Cor</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        <input
          type="number"
          placeholder="Orçamento mensal (opcional)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 outline-none focus:border-accent"
        />

        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="w-full rounded-lg bg-accent text-black font-semibold py-2.5 disabled:opacity-40"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </Modal>
  )
}
