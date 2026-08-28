import { useState, type FormEvent } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Modal from '../../components/Modal'
import { Card, Field, MoneyField, Select, SubmitButton, StateMessage } from '../../components/ui'
import {
  createInvestment,
  createInvestmentEntry,
  deleteInvestment,
  updateInvestment,
} from '../../lib/data'
import { useFinancas, CORES } from '../../lib/financas'
import type { Investment, InvestmentKind } from '../../lib/types'
import { formatMoney } from '../../lib/format'
import { AvisoDoBanco } from './FinanceHome'
import { useSalvar } from '../../lib/useSalvar'

/**
 * INVESTIMENTOS.
 *
 * A pergunta que esta tela responde é "quanto eu coloquei e quanto virou".
 *
 * Por isso cada investimento guarda duas coisas separadas: os **aportes** (as
 * vezes em que o Joshua colocou dinheiro, somados pelo site) e o **valor de
 * hoje**, que ele atualiza quando quiser olhar o app do banco. A diferença
 * entre os dois é o rendimento — e é essa a conta que interessa.
 */
const TIPOS: { id: InvestmentKind; rotulo: string }[] = [
  { id: 'renda_fixa', rotulo: 'Renda fixa' },
  { id: 'acoes', rotulo: 'Ações' },
  { id: 'fii', rotulo: 'Fundos imobiliários' },
  { id: 'cripto', rotulo: 'Cripto' },
  { id: 'fundo', rotulo: 'Fundo' },
  { id: 'outro', rotulo: 'Outro' },
]

const rotuloDoTipo = (k: InvestmentKind) => TIPOS.find((t) => t.id === k)?.rotulo ?? 'Outro'

export default function FinanceInvestments() {
  const { investimentos, aportes, carregando, faltaSchemaNovo, recarregar } = useFinancas()
  const [criando, setCriando] = useState(false)
  const [aportando, setAportando] = useState<Investment | null>(null)
  const [atualizando, setAtualizando] = useState<Investment | null>(null)

  const investidoPorId = new Map<string, number>()
  for (const a of aportes) {
    investidoPorId.set(a.investment_id, (investidoPorId.get(a.investment_id) ?? 0) + Number(a.amount))
  }

  const totalInvestido = [...investidoPorId.values()].reduce((s, v) => s + v, 0)
  const totalHoje = investimentos.reduce((s, i) => s + Number(i.current_value), 0)
  const rendimento = totalHoje - totalInvestido

  if (faltaSchemaNovo) return <AvisoDoBanco />

  return (
    <div className="space-y-5">
      <StateMessage loading={carregando} error={null} />

      {/* ---- O resumo da carteira ---- */}
      <Card className="p-5">
        <p className="text-xs text-text-dim mb-1">Valor hoje</p>
        <p className="text-3xl font-extrabold tabular-nums" style={{ color: CORES.investimento }}>
          {formatMoney(totalHoje)}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-soft">
          <div>
            <p className="text-xs text-text-dim mb-0.5">Você aplicou</p>
            <p className="font-bold tabular-nums">{formatMoney(totalInvestido)}</p>
          </div>
          <div>
            <p className="text-xs text-text-dim mb-0.5">Rendimento</p>
            <p
              className="font-bold tabular-nums flex items-center gap-1"
              style={{
                color:
                  rendimento > 0 ? CORES.entrada : rendimento < 0 ? CORES.saida : undefined,
              }}
            >
              {rendimento > 0 ? <TrendingUp size={14} /> : rendimento < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              {formatMoney(Math.abs(rendimento))}
            </p>
          </div>
        </div>
      </Card>

      <button
        onClick={() => setCriando(true)}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent
                   text-white font-semibold py-3.5 hover:bg-accent-light
                   active:scale-[0.99] transition-all"
      >
        <Plus size={19} strokeWidth={2.5} /> Novo investimento
      </button>

      {!carregando && investimentos.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl py-12 text-center px-6">
          <p className="text-text-dim text-sm">
            Nenhum investimento ainda. Cadastre um e vá registrando cada vez que colocar dinheiro
            nele.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {investimentos.map((inv) => {
          const aplicado = investidoPorId.get(inv.id) ?? 0
          const ganho = Number(inv.current_value) - aplicado
          return (
            <Card key={inv.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{inv.name}</p>
                  <p className="text-[11px] text-text-faint">{rotuloDoTipo(inv.kind)}</p>
                </div>
                <button
                  onClick={async () => {
                    await deleteInvestment(inv.id)
                    await recarregar()
                  }}
                  className="text-text-faint hover:text-danger transition-colors p-1 shrink-0"
                  aria-label="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-text-faint">Aplicado</p>
                  <p className="text-sm font-semibold tabular-nums">{formatMoney(aplicado)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-faint">Hoje</p>
                  <p
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: CORES.investimento }}
                  >
                    {formatMoney(Number(inv.current_value))}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-faint">Rendeu</p>
                  <p
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color: ganho > 0 ? CORES.entrada : ganho < 0 ? CORES.saida : undefined,
                    }}
                  >
                    {ganho >= 0 ? '+' : '−'} {formatMoney(Math.abs(ganho))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setAportando(inv)}
                  className="rounded-xl border border-border py-2 text-xs font-semibold
                             text-text-dim hover:border-accent hover:text-accent transition-colors"
                >
                  + Aportar
                </button>
                <button
                  onClick={() => setAtualizando(inv)}
                  className="rounded-xl border border-border py-2 text-xs font-semibold
                             text-text-dim hover:border-accent hover:text-accent transition-colors"
                >
                  Atualizar valor
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {criando && <FormularioInvestimento onClose={() => setCriando(false)} onSaved={recarregar} />}
      {aportando && (
        <FormularioAporte
          investimento={aportando}
          onClose={() => setAportando(null)}
          onSaved={recarregar}
        />
      )}
      {atualizando && (
        <FormularioValor
          investimento={atualizando}
          onClose={() => setAtualizando(null)}
          onSaved={recarregar}
        />
      )}
    </div>
  )
}

function FormularioInvestimento({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<InvestmentKind>('renda_fixa')
  const [inicial, setInicial] = useState(0)
  const { salvando, erro, salvar: executar } = useSalvar()

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || salvando) return
    const ok = await executar(async () => {
      // O valor inicial vira ao mesmo tempo o primeiro aporte e o valor de hoje:
      // acabou de aplicar, então ainda não rendeu nada.
      const id = await createInvestment({ name: name.trim(), kind, current_value: inicial, notes: '' })
      if (inicial > 0) {
        const d = new Date()
        await createInvestmentEntry({
          investment_id: id,
          amount: inicial,
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        })
      }
      await onSaved()
    })
    if (ok) onClose()
  }

  return (
    <Modal title="Novo investimento" onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <Field
          autoFocus
          label="Nome"
          placeholder="Tesouro Selic, CDB do banco..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as InvestmentKind)}>
          {TIPOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.rotulo}
            </option>
          ))}
        </Select>
        <MoneyField label="Quanto você já tem aplicado nele" value={inicial} onValue={setInicial} />
        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando || !name.trim()}>
          {salvando ? 'Salvando...' : 'Criar'}
        </SubmitButton>
      </form>
    </Modal>
  )
}

function FormularioAporte({
  investimento,
  onClose,
  onSaved,
}: {
  investimento: Investment
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const { salvando, erro, salvar: executar } = useSalvar()

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (amount <= 0 || salvando) return
    const ok = await executar(async () => {
      await createInvestmentEntry({ investment_id: investimento.id, amount, date })
      // Quem acabou de colocar dinheiro tem esse dinheiro lá dentro: somar ao
      // valor de hoje evita o rendimento aparecer negativo sem motivo.
      await updateInvestment(investimento.id, {
        current_value: Number(investimento.current_value) + amount,
      })
      await onSaved()
    })
    if (ok) onClose()
  }

  return (
    <Modal title={`Aportar em ${investimento.name}`} onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <MoneyField autoFocus label="Quanto você colocou" value={amount} onValue={setAmount} />
        <Field label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando || amount <= 0}>
          {salvando ? 'Salvando...' : 'Registrar aporte'}
        </SubmitButton>
      </form>
    </Modal>
  )
}

function FormularioValor({
  investimento,
  onClose,
  onSaved,
}: {
  investimento: Investment
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [valor, setValor] = useState(Number(investimento.current_value))
  const { salvando, erro, salvar: executar } = useSalvar()

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (salvando) return
    const ok = await executar(async () => {
      await updateInvestment(investimento.id, { current_value: valor })
      await onSaved()
    })
    if (ok) onClose()
  }

  return (
    <Modal title={`Valor de ${investimento.name}`} onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <p className="text-text-dim text-xs leading-relaxed">
          Olhe o app do banco ou da corretora e escreva aqui quanto esse investimento vale hoje. O
          site calcula sozinho quanto rendeu.
        </p>
        <MoneyField autoFocus label="Valor hoje" value={valor} onValue={setValor} />
        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando}>{salvando ? 'Salvando...' : 'Atualizar'}</SubmitButton>
      </form>
    </Modal>
  )
}
