import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { findModule } from '../lib/nav'
import { LogoMark } from './Logo'
import HeroEmblem from './HeroEmblem'

/**
 * Casca das telas internas. A Home fica fora daqui de propósito — lá o Joshua
 * quer só os quadradinhos, sem navegação lateral.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const active = findModule(pathname)

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/80 border-b border-border-soft">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-dim hover:text-text transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
            <span className="text-sm hidden sm:inline">Início</span>
          </Link>

          {active && (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-border">/</span>
              <HeroEmblem emblem={active.emblem} size={28} alive />
              <span className="min-w-0">
                <span className="block font-semibold text-sm truncate leading-tight">
                  {active.label}
                </span>
                <span
                  className="block text-[10px] truncate leading-tight"
                  style={{ color: active.color }}
                >
                  {active.hero}
                </span>
              </span>
            </div>
          )}

          <Link to="/" className="ml-auto shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            <LogoMark size={28} />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-7 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
