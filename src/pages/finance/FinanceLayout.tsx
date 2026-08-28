import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { FinancasProvider, useFinancas } from '../../lib/financas'

/**
 * As quatro áreas de Finanças.
 *
 * São quatro de propósito: numa tela de celular, cinco abas já viram uma
 * fileira apertada de nomes cortados. Categorias, Orçamento, Contas e Metas
 * ficam dentro de "Mais", que é a tela de ajustes do módulo.
 */
const TABS = [
  { to: '/financas', label: 'Resumo', curto: 'Resumo', end: true },
  { to: '/financas/lancamentos', label: 'Lançamentos', curto: 'Lanç.', end: false },
  { to: '/financas/investimentos', label: 'Investir', curto: 'Investir', end: false },
  { to: '/financas/mais', label: 'Mais', curto: 'Mais', end: false },
]

/** Telas em que trocar de mês muda o que aparece. */
const COM_MES = ['/financas', '/financas/lancamentos']

export default function FinanceLayout() {
  return (
    <FinancasProvider>
      <Conteudo />
    </FinancasProvider>
  )
}

function Conteudo() {
  const { pathname } = useLocation()
  const mostrarMes = COM_MES.includes(pathname)

  return (
    <div>
      {/* O Capitão fala com o Joshua pelo `HeroSpeech` do Layout — aqui ficam
          só as abas e o seletor de mês. */}
      <nav className="grid grid-cols-4 mb-5 border-b border-border">
        {TABS.map(({ to, label, curto, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `text-center px-1 py-2.5 text-[13px] sm:text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive ? 'border-accent text-accent' : 'border-transparent text-text-dim hover:text-text'
              }`
            }
          >
            <span className="sm:hidden">{curto}</span>
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      {mostrarMes && <SeletorDeMes />}

      <Outlet />
    </div>
  )
}

/**
 * Troca o mês que está sendo visto.
 *
 * Fica acima do conteúdo porque manda em tudo que aparece embaixo: os quatro
 * cartões, os gráficos e a lista de lançamentos.
 */
function SeletorDeMes() {
  const { rotuloDoMes, mesAnterior, proximoMes, eMesAtual, irParaMes } = useFinancas()
  const hoje = new Date()

  return (
    <div className="flex items-center justify-between gap-2 mb-5">
      <button
        onClick={mesAnterior}
        aria-label="Mês anterior"
        className="w-9 h-9 shrink-0 rounded-xl border border-border text-text-dim
                   hover:border-accent hover:text-accent transition-colors
                   flex items-center justify-center"
      >
        <ChevronLeft size={18} />
      </button>

      <p className="flex-1 text-center font-semibold first-letter:uppercase truncate">
        {rotuloDoMes}
      </p>

      {/* Só aparece quando o Joshua está olhando outro mês: assim ele sempre
          tem um caminho de volta sem contar cliques. */}
      {!eMesAtual && (
        <button
          onClick={() => irParaMes({ ano: hoje.getFullYear(), mes: hoje.getMonth() })}
          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border
                     px-2.5 h-9 text-xs text-text-dim hover:border-accent hover:text-accent
                     transition-colors"
        >
          <RotateCcw size={13} /> Hoje
        </button>
      )}

      <button
        onClick={proximoMes}
        aria-label="Próximo mês"
        className="w-9 h-9 shrink-0 rounded-xl border border-border text-text-dim
                   hover:border-accent hover:text-accent transition-colors
                   flex items-center justify-center"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
