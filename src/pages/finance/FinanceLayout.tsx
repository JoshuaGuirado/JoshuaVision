import { NavLink, Outlet } from 'react-router-dom'

/**
 * As quatro telas de Finanças.
 *
 * `curto` é o nome usado no celular: "Lançamentos" e "Orçamento" não cabem
 * lado a lado numa tela estreita, e era isso que obrigava a arrastar a barra.
 */
const TABS = [
  { to: '/financas', label: 'Resumo', curto: 'Resumo', end: true },
  { to: '/financas/lancamentos', label: 'Lançamentos', curto: 'Lanç.', end: false },
  { to: '/financas/categorias', label: 'Categorias', curto: 'Categ.', end: false },
  { to: '/financas/orcamento', label: 'Orçamento', curto: 'Orçam.', end: false },
]

export default function FinanceLayout() {
  return (
    <div>
      {/* O Capitão fala com o Joshua pelo `HeroSpeech` do Layout — aqui ficam
          só as abas do módulo. */}
      {/* Grade de 4: as abas repartem a largura e cabem sempre — nada de
          arrastar a barra para achar a última. */}
      <nav className="grid grid-cols-4 mb-6 border-b border-border">
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
      <Outlet />
    </div>
  )
}
