import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  gastosPorCategoria,
  historicoMensal,
  resumoDoMes,
  useFinancas,
  CORES,
} from '../../lib/financas'
import { formatMoney } from '../../lib/format'
import { Card, StateMessage } from '../../components/ui'
import { GraficoCategorias, GraficoMensal } from '../../components/finance/Graficos'

/**
 * RESUMO DO MÊS.
 *
 * Quatro números no topo, dois gráficos embaixo. Nada mais: essa é a tela que
 * o Joshua abre para bater o olho, não para trabalhar.
 */
export default function FinanceHome() {
  const financas = useFinancas()
  const { carregando, erro, faltaSchemaNovo, mes, irParaMes } = financas
  const { entradas, saidas, saldoDisponivel, investido } = resumoDoMes(financas)
  const meses = historicoMensal(financas)
  const categorias = gastosPorCategoria(financas)

  return (
    <div className="space-y-5">
      <StateMessage loading={carregando} error={erro} />

      {faltaSchemaNovo && <AvisoDoBanco />}

      {/* ---- Os quatro números ---- */}
      <div className="grid grid-cols-2 gap-3">
        <Numero
          rotulo="Saldo disponível"
          valor={saldoDisponivel}
          icone={Wallet}
          cor={saldoDisponivel >= 0 ? undefined : CORES.saida}
          destaque
          ajuda="O que existe nas contas hoje"
        />
        <Numero
          rotulo="Investido"
          valor={investido}
          icone={TrendingUp}
          cor={CORES.investimento}
          destaque
          ajuda="Tudo que você já aplicou"
        />
        <Numero rotulo="Entradas" valor={entradas} icone={ArrowUpRight} cor={CORES.entrada} />
        <Numero rotulo="Saídas" valor={saidas} icone={ArrowDownRight} cor={CORES.saida} />
      </div>

      {/* ---- Evolução ---- */}
      <Secao titulo="Últimos 6 meses" ajuda="Toque numa coluna para ver aquele mês">
        <GraficoMensal
          meses={meses}
          mesAtivo={`${mes.ano}-${mes.mes}`}
          aoEscolherMes={(m) => irParaMes({ ano: m.ano, mes: m.mes })}
        />
      </Secao>

      {/* ---- Para onde foi o dinheiro ---- */}
      <Secao titulo="Onde você gastou">
        <GraficoCategorias fatias={categorias} />
      </Secao>

      {/* ---- Atalho para lançar ---- */}
      <Link
        to="/financas/lancamentos"
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent
                   text-white font-semibold py-3.5 hover:bg-accent-light transition-colors"
      >
        <Plus size={18} strokeWidth={2.5} /> Adicionar lançamento
      </Link>
    </div>
  )
}

/** Um dos números do topo. */
function Numero({
  rotulo,
  valor,
  icone: Icone,
  cor,
  destaque,
  ajuda,
}: {
  rotulo: string
  valor: number
  icone: LucideIcon
  cor?: string
  /** Cartão maior, para os dois números principais. */
  destaque?: boolean
  ajuda?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icone size={14} style={{ color: cor ?? 'var(--color-text-dim)' }} />
        <span className="text-xs text-text-dim truncate">{rotulo}</span>
      </div>
      <p
        className={`font-extrabold tabular-nums ${destaque ? 'text-xl' : 'text-lg'}`}
        style={{ color: cor }}
      >
        {formatMoney(valor)}
      </p>
      {ajuda && <p className="text-[10px] text-text-faint mt-1 leading-tight">{ajuda}</p>}
    </Card>
  )
}

function Secao({
  titulo,
  ajuda,
  children,
}: {
  titulo: string
  ajuda?: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-sm">{titulo}</h2>
        {ajuda && <p className="text-[11px] text-text-faint mt-0.5">{ajuda}</p>}
      </div>
      {children}
    </Card>
  )
}

/** Aviso claro quando as tabelas novas ainda não existem no Supabase. */
export function AvisoDoBanco() {
  return (
    <div className="rounded-2xl border border-dashed border-accent/50 bg-accent/5 p-4">
      <p className="text-sm font-semibold text-accent mb-1">Falta um passo no Supabase</p>
      <p className="text-text-dim text-xs leading-relaxed">
        Contas, investimentos e metas precisam de tabelas novas. Abra o Supabase, vá em{' '}
        <span className="text-text">SQL Editor → New query</span>, cole o conteúdo do arquivo{' '}
        <span className="text-text">supabase/schema-financas-v2.sql</span> e clique em Run. Depois
        recarregue esta página.
      </p>
    </div>
  )
}
