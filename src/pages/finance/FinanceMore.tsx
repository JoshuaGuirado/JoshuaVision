import { Link } from 'react-router-dom'
import { ChevronRight, Landmark, Target, Tags, PieChart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../../components/ui'
import { useFinancas } from '../../lib/financas'
import { AvisoDoBanco } from './FinanceHome'

/**
 * O RESTO DE FINANÇAS.
 *
 * Quatro telas que o Joshua abre de vez em quando — não merecem uma aba fixa
 * roubando espaço no celular, mas precisam de um lugar óbvio para serem
 * achadas.
 */
const ITENS: {
  to: string
  titulo: string
  descricao: string
  icone: LucideIcon
  cor: string
}[] = [
  {
    to: '/financas/contas',
    titulo: 'Contas',
    descricao: 'Onde o seu dinheiro fica: banco, carteira, cartão',
    icone: Landmark,
    cor: '#4d8ff0',
  },
  {
    to: '/financas/metas',
    titulo: 'Metas financeiras',
    descricao: 'Juntar dinheiro para alguma coisa',
    icone: Target,
    cor: '#ec1d24',
  },
  {
    to: '/financas/categorias',
    titulo: 'Categorias',
    descricao: 'Como os gastos são separados',
    icone: Tags,
    cor: '#f0a92c',
  },
  {
    to: '/financas/orcamento',
    titulo: 'Orçamento',
    descricao: 'Quanto você pode gastar em cada categoria',
    icone: PieChart,
    cor: '#31a771',
  },
]

export default function FinanceMore() {
  const { faltaSchemaNovo, contas, metas } = useFinancas()

  return (
    <div className="space-y-3">
      {faltaSchemaNovo && <AvisoDoBanco />}

      {ITENS.map(({ to, titulo, descricao, icone: Icone, cor }) => {
        // Um número ao lado poupa o Joshua de entrar só para conferir.
        const contagem =
          to === '/financas/contas'
            ? contas.length
            : to === '/financas/metas'
              ? metas.length
              : undefined

        return (
          <Link key={to} to={to} className="block">
            <Card className="flex items-center gap-3.5 px-4 py-4 hover:border-border">
              <span
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${cor}22` }}
              >
                <Icone size={18} style={{ color: cor }} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-sm">{titulo}</span>
                <span className="block text-[11px] text-text-faint truncate">{descricao}</span>
              </span>

              {contagem !== undefined && contagem > 0 && (
                <span className="text-xs text-text-dim tabular-nums shrink-0">{contagem}</span>
              )}
              <ChevronRight size={16} className="text-text-faint shrink-0" />
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
