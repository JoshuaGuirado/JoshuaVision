import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tags, PiggyBank, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/lancamentos', label: 'Lançamentos', icon: ArrowLeftRight, end: false },
  { to: '/categorias', label: 'Categorias', icon: Tags, end: false },
  { to: '/orcamento', label: 'Orçamento', icon: PiggyBank, end: false },
]

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-svh flex flex-col bg-bg">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <span className="font-extrabold tracking-tight">
          T<span className="text-accent">J</span>V
        </span>
        <button
          onClick={signOut}
          className="text-text-dim hover:text-text transition-colors"
          aria-label="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 max-w-lg w-full mx-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-accent' : 'text-text-dim'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
