import { NavLink, Outlet } from 'react-router-dom'
import HeroBanner from '../../components/HeroBanner'

const TABS = [
  { to: '/financas', label: 'Dashboard', end: true },
  { to: '/financas/lancamentos', label: 'Lançamentos', end: false },
  { to: '/financas/categorias', label: 'Categorias', end: false },
  { to: '/financas/orcamento', label: 'Orçamento', end: false },
]

export default function FinanceLayout() {
  return (
    <div>
      {/* A arte é opcional: se /public/herois/capitao.png não existir, o banner
          mostra só o escudo desenhado. */}
      <HeroBanner
        hero="Capitão América"
        emblem="shield"
        color="#e0263c"
        image="/herois/capitao-1.jpg"
        tagline="Disciplina e defesa do seu patrimônio"
      />

      <nav className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {TABS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive ? 'border-accent text-accent' : 'border-transparent text-text-dim hover:text-text'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
