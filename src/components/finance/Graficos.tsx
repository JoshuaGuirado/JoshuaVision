import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../lib/format'
import { CORES } from '../../lib/financas'

/**
 * OS GRÁFICOS DAS FINANÇAS.
 *
 * Feitos à mão em SVG, sem biblioteca: são dois formatos simples e uma
 * biblioteca de gráficos pesaria mais que o site inteiro.
 *
 * As cores de entrada (verde) e saída (vermelho) foram conferidas para quem
 * não distingue verde de vermelho: nunca é só a cor que diz quem é quem —
 * cada barra tem ícone, rótulo e posição fixa.
 */

const dinheiroCurto = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.', ',')}k` : String(Math.round(v))

// ---------------------------------------------------------------------------

export type Mes = {
  chave: string
  rotulo: string
  ano: number
  mes: number
  entradas: number
  saidas: number
}

/**
 * Entradas e saídas dos últimos meses, lado a lado.
 *
 * Tocar numa coluna mostra os valores daquele mês; tocar de novo esconde.
 */
export function GraficoMensal({
  meses,
  mesAtivo,
  aoEscolherMes,
}: {
  meses: Mes[]
  /** Chave do mês que está sendo visto, destacado no gráfico. */
  mesAtivo: string
  aoEscolherMes: (m: Mes) => void
}) {
  const [aberto, setAberto] = useState<string | null>(null)
  const teto = Math.max(...meses.flatMap((m) => [m.entradas, m.saidas]), 1)
  const vazio = meses.every((m) => m.entradas === 0 && m.saidas === 0)

  if (vazio) {
    return (
      <p className="text-text-dim text-sm text-center py-8">
        Sem movimento nos últimos meses ainda.
      </p>
    )
  }

  return (
    <div>
      {/* Legenda com ícone: a identidade nunca depende só da cor. */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 text-text-dim">
          <ArrowUpRight size={13} style={{ color: CORES.entrada }} />
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CORES.entrada }} />
          Entradas
        </span>
        <span className="flex items-center gap-1.5 text-text-dim">
          <ArrowDownRight size={13} style={{ color: CORES.saida }} />
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CORES.saida }} />
          Saídas
        </span>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-36">
        {meses.map((m) => {
          const ativo = m.chave === mesAtivo
          const mostrando = aberto === m.chave
          return (
            <button
              key={m.chave}
              onClick={() => {
                setAberto((a) => (a === m.chave ? null : m.chave))
                aoEscolherMes(m)
              }}
              className="group flex-1 h-full flex flex-col justify-end items-center gap-1.5 rounded-lg
                         hover:bg-surface-2 transition-colors pt-5 relative"
              title={`${m.rotulo}: ${formatMoney(m.entradas)} de entrada, ${formatMoney(m.saidas)} de saída`}
            >
              {mostrando && (
                <span
                  className="tjv-pop absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap
                             rounded-lg border border-border bg-surface-2 px-2 py-1 text-[10px] leading-tight
                             shadow-xl"
                >
                  <span style={{ color: CORES.entrada }}>+{dinheiroCurto(m.entradas)}</span>
                  {'  '}
                  <span style={{ color: CORES.saida }}>−{dinheiroCurto(m.saidas)}</span>
                </span>
              )}

              {/* as duas barras, sempre na mesma ordem: entrada à esquerda */}
              <span className="flex-1 w-full flex items-end justify-center gap-[3px]">
                <span
                  className="w-[42%] rounded-t transition-all"
                  style={{
                    height: `${Math.max((m.entradas / teto) * 100, m.entradas > 0 ? 3 : 0)}%`,
                    backgroundColor: CORES.entrada,
                    opacity: ativo ? 1 : 0.55,
                  }}
                />
                <span
                  className="w-[42%] rounded-t transition-all"
                  style={{
                    height: `${Math.max((m.saidas / teto) * 100, m.saidas > 0 ? 3 : 0)}%`,
                    backgroundColor: CORES.saida,
                    opacity: ativo ? 1 : 0.55,
                  }}
                />
              </span>

              <span
                className={`text-[10px] leading-none ${ativo ? 'text-text font-semibold' : 'text-text-faint'}`}
              >
                {m.rotulo}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export type FatiaCategoria = { id: string; nome: string; cor: string; total: number }

/**
 * Gastos por categoria — barras deitadas, da maior para a menor.
 *
 * Barra deitada em vez de pizza de propósito: com o nome e o valor escritos em
 * cada linha, dá para comparar e ler sem depender da cor nem de legenda.
 */
export function GraficoCategorias({ fatias }: { fatias: FatiaCategoria[] }) {
  if (fatias.length === 0) {
    return <p className="text-text-dim text-sm text-center py-8">Nenhum gasto neste mês.</p>
  }

  const total = fatias.reduce((s, f) => s + f.total, 0)
  const maior = fatias[0].total

  return (
    <div className="space-y-3">
      {fatias.slice(0, 8).map((f) => (
        <div key={f.id}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-sm truncate">{f.nome}</span>
            <span className="text-sm font-semibold shrink-0">
              {formatMoney(f.total)}
              <span className="text-text-faint font-normal text-xs ml-1.5">
                {Math.round((f.total / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(f.total / maior) * 100}%`, backgroundColor: f.cor }}
            />
          </div>
        </div>
      ))}

      {fatias.length > 8 && (
        <p className="text-text-faint text-xs pt-1">
          e mais {fatias.length - 8} categoria{fatias.length - 8 === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
