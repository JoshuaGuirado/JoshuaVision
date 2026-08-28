import { useState, type FormEvent } from 'react'
import { Plus, Trash2, Target, Check } from 'lucide-react'
import Modal from '../../components/Modal'
import { Card, Field, MoneyField, SubmitButton, StateMessage } from '../../components/ui'
import { createFinancialGoal, deleteFinancialGoal, updateFinancialGoal } from '../../lib/data'
import { useFinancas, CORES } from '../../lib/financas'
import type { FinancialGoal } from '../../lib/types'
import { formatMoney } from '../../lib/format'
import { AvisoDoBanco } from './FinanceHome'

/**
 * METAS FINANCEIRAS — juntar dinheiro para alguma coisa.
 *
 * Diferente das Metas do módulo do Homem-Aranha: aqui a meta é um valor, e o
 * progresso é dinheiro guardado. Cada meta mostra quanto falta e — quando há
 * prazo — quanto precisa guardar por mês para chegar lá.
 */
const CORES_META = ['#ec1d24', '#31a771', '#4d8ff0', '#f0a92c', '#9d7ce0', '#ff7ac0']

export default function FinanceGoals() {
  const { metas, carregando, faltaSchemaNovo, recarregar } = useFinancas()
  const [criando, setCriando] = useState(false)
  const [guardando, setGuardando] = useState<FinancialGoal | null>(null)

  if (faltaSchemaNovo) return <AvisoDoBanco />

  return (
    <div className="space-y-5">
      <StateMessage loading={carregando} error={null} />

      <button
        onClick={() => setCriando(true)}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent
                   text-white font-semibold py-3.5 hover:bg-accent-light
                   active:scale-[0.99] transition-all"
      >
        <Plus size={19} strokeWidth={2.5} /> Nova meta
      </button>

      {!carregando && metas.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl py-12 text-center px-6">
          <Target size={22} className="mx-auto mb-3 text-text-faint" strokeWidth={1.5} />
          <p className="text-text-dim text-sm">
            Uma viagem, um carro, uma reserva de emergência. Diga quanto custa e vá marcando o que
            já guardou.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {metas.map((m) => (
          <CartaoDeMeta
            key={m.id}
            meta={m}
            aoGuardar={() => setGuardando(m)}
            aoExcluir={async () => {
              await deleteFinancialGoal(m.id)
              await recarregar()
            }}
          />
        ))}
      </div>

      {criando && <FormularioMeta onClose={() => setCriando(false)} onSaved={recarregar} />}
      {guardando && (
        <FormularioGuardar
          meta={guardando}
          onClose={() => setGuardando(null)}
          onSaved={recarregar}
        />
      )}
    </div>
  )
}

function CartaoDeMeta({
  meta,
  aoGuardar,
  aoExcluir,
}: {
  meta: FinancialGoal
  aoGuardar: () => void
  aoExcluir: () => Promise<void>
}) {
  const guardado = Number(meta.saved_amount)
  const alvo = Number(meta.target_amount)
  const pct = Math.min(100, Math.round((guardado / alvo) * 100))
  const falta = Math.max(0, alvo - guardado)
  const completa = falta === 0

  // Quanto precisa guardar por mês para chegar no prazo.
  let porMes: number | null = null
  if (meta.deadline && !completa) {
    const fim = new Date(meta.deadline + 'T00:00:00')
    const hoje = new Date()
    const meses = Math.max(
      1,
      (fim.getFullYear() - hoje.getFullYear()) * 12 + (fim.getMonth() - hoje.getMonth()),
    )
    porMes = falta / meses
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate flex items-center gap-1.5">
            {completa && <Check size={14} style={{ color: CORES.entrada }} />}
            {meta.title}
          </p>
          <p className="text-[11px] text-text-faint">
            {completa
              ? 'Meta alcançada!'
              : `Faltam ${formatMoney(falta)}${
                  porMes ? ` · ${formatMoney(porMes)} por mês` : ''
                }`}
          </p>
        </div>
        <button
          onClick={aoExcluir}
          className="text-text-faint hover:text-danger transition-colors p-1 shrink-0"
          aria-label="Excluir"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-sm font-bold tabular-nums" style={{ color: meta.color }}>
          {formatMoney(guardado)}
        </span>
        <span className="text-xs text-text-faint tabular-nums">de {formatMoney(alvo)}</span>
      </div>

      <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: meta.color }}
        />
      </div>

      <button
        onClick={aoGuardar}
        className="w-full rounded-xl border border-border py-2 text-xs font-semibold
                   text-text-dim hover:border-accent hover:text-accent transition-colors"
      >
        Guardei mais
      </button>
    </Card>
  )
}

function FormularioMeta({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [alvo, setAlvo] = useState(0)
  const [guardado, setGuardado] = useState(0)
  const [deadline, setDeadline] = useState('')
  const [color, setColor] = useState(CORES_META[0])
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || alvo <= 0 || salvando) return
    setSalvando(true)
    await createFinancialGoal({
      title: title.trim(),
      target_amount: alvo,
      saved_amount: guardado,
      deadline: deadline || null,
      color,
    })
    await onSaved()
    onClose()
  }

  return (
    <Modal title="Nova meta" onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <Field
          autoFocus
          label="O que você quer"
          placeholder="Viagem, reserva de emergência..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <MoneyField label="Quanto custa" value={alvo} onValue={setAlvo} />
        <MoneyField label="Quanto você já guardou" value={guardado} onValue={setGuardado} />
        <Field
          label="Prazo (opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div>
          <span className="text-xs text-text-dim mb-2 block">Cor</span>
          <div className="flex gap-2">
            {CORES_META.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                className="w-8 h-8 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? 'var(--color-text)' : 'transparent',
                  transform: color === c ? 'scale(1.1)' : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <SubmitButton disabled={salvando || !title.trim() || alvo <= 0}>
          {salvando ? 'Salvando...' : 'Criar meta'}
        </SubmitButton>
      </form>
    </Modal>
  )
}

function FormularioGuardar({
  meta,
  onClose,
  onSaved,
}: {
  meta: FinancialGoal
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [valor, setValor] = useState(0)
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (valor <= 0 || salvando) return
    setSalvando(true)
    await updateFinancialGoal(meta.id, { saved_amount: Number(meta.saved_amount) + valor })
    await onSaved()
    onClose()
  }

  return (
    <Modal title={meta.title} onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <p className="text-text-dim text-xs">
          Já guardados: <span className="text-text">{formatMoney(Number(meta.saved_amount))}</span>
        </p>
        <MoneyField autoFocus label="Quanto você guardou agora" value={valor} onValue={setValor} />
        <SubmitButton disabled={salvando || valor <= 0}>
          {salvando ? 'Salvando...' : 'Adicionar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
