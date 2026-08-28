import { useState, type FormEvent } from 'react'
import { Plus, Trash2, Landmark, PiggyBank, Wallet, CreditCard, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import { Card, Field, MoneyField, Select, SubmitButton, StateMessage } from '../../components/ui'
import { createAccount, deleteAccount } from '../../lib/data'
import { useFinancas, CORES } from '../../lib/financas'
import type { AccountKind } from '../../lib/types'
import { formatMoney } from '../../lib/format'
import { AvisoDoBanco } from './FinanceHome'
import { useSalvar } from '../../lib/useSalvar'

/**
 * CONTAS — onde o dinheiro está.
 *
 * O saldo de cada conta é calculado, não digitado: é o que havia nela quando o
 * Joshua a cadastrou, mais tudo que entrou e menos tudo que saiu marcado
 * naquela conta. Assim o número nunca fica desatualizado por esquecimento.
 */
const TIPOS: { id: AccountKind; rotulo: string; icone: LucideIcon }[] = [
  { id: 'corrente', rotulo: 'Conta corrente', icone: Landmark },
  { id: 'poupanca', rotulo: 'Poupança', icone: PiggyBank },
  { id: 'carteira', rotulo: 'Dinheiro em espécie', icone: Wallet },
  { id: 'cartao', rotulo: 'Cartão de crédito', icone: CreditCard },
  { id: 'outro', rotulo: 'Outro', icone: Circle },
]

const CORES_CONTA = ['#4d8ff0', '#31a771', '#ec1d24', '#f0a92c', '#9d7ce0', '#aab3c4']

export default function FinanceAccounts() {
  const { contas, transacoes, carregando, faltaSchemaNovo, recarregar } = useFinancas()
  const [criando, setCriando] = useState(false)

  if (faltaSchemaNovo) return <AvisoDoBanco />

  const saldoDe = (contaId: string, inicial: number) =>
    transacoes
      .filter((t) => t.account_id === contaId)
      .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), inicial)

  const total = contas.reduce((s, c) => s + saldoDe(c.id, Number(c.initial_balance)), 0)

  return (
    <div className="space-y-5">
      <StateMessage loading={carregando} error={null} />

      {contas.length > 0 && (
        <Card className="p-5">
          <p className="text-xs text-text-dim mb-1">Somando todas as contas</p>
          <p
            className="text-3xl font-extrabold tabular-nums"
            style={{ color: total >= 0 ? undefined : CORES.saida }}
          >
            {formatMoney(total)}
          </p>
        </Card>
      )}

      <button
        onClick={() => setCriando(true)}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent
                   text-white font-semibold py-3.5 hover:bg-accent-light
                   active:scale-[0.99] transition-all"
      >
        <Plus size={19} strokeWidth={2.5} /> Nova conta
      </button>

      {!carregando && contas.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl py-12 text-center px-6">
          <p className="text-text-dim text-sm">
            Cadastre onde o seu dinheiro fica — banco, poupança, dinheiro na carteira. Depois é só
            marcar a conta em cada lançamento.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {contas.map((c) => {
          const tipo = TIPOS.find((t) => t.id === c.kind) ?? TIPOS[4]
          const Icone = tipo.icone
          const saldo = saldoDe(c.id, Number(c.initial_balance))
          return (
            <Card key={c.id} className="flex items-center gap-3 px-4 py-3.5">
              <span
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${c.color}22` }}
              >
                <Icone size={18} style={{ color: c.color }} />
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.name}</p>
                <p className="text-[11px] text-text-faint">{tipo.rotulo}</p>
              </div>

              <span
                className="text-sm font-bold tabular-nums shrink-0"
                style={{ color: saldo < 0 ? CORES.saida : undefined }}
              >
                {formatMoney(saldo)}
              </span>

              <button
                onClick={async () => {
                  await deleteAccount(c.id)
                  await recarregar()
                }}
                className="text-text-faint hover:text-danger transition-colors p-1 shrink-0"
                aria-label="Excluir"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          )
        })}
      </div>

      {criando && <FormularioConta onClose={() => setCriando(false)} onSaved={recarregar} />}
    </div>
  )
}

function FormularioConta({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<AccountKind>('corrente')
  const [color, setColor] = useState(CORES_CONTA[0])
  const [inicial, setInicial] = useState(0)
  const { salvando, erro, salvar: executar } = useSalvar()

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || salvando) return
    const ok = await executar(async () => {
      await createAccount({ name: name.trim(), kind, color, initial_balance: inicial })
      await onSaved()
    })
    if (ok) onClose()
  }

  return (
    <Modal title="Nova conta" onClose={onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <Field
          autoFocus
          label="Nome"
          placeholder="Nubank, Carteira, Poupança..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as AccountKind)}>
          {TIPOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.rotulo}
            </option>
          ))}
        </Select>

        <MoneyField
          label="Quanto tem nela hoje"
          value={inicial}
          onValue={setInicial}
        />

        <div>
          <span className="text-xs text-text-dim mb-2 block">Cor</span>
          <div className="flex gap-2">
            {CORES_CONTA.map((c) => (
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

        {erro && <p className="text-danger text-sm">{erro}</p>}

        <SubmitButton disabled={salvando || !name.trim()}>
          {salvando ? 'Salvando...' : 'Criar conta'}
        </SubmitButton>
      </form>
    </Modal>
  )
}
