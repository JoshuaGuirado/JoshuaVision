import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS, SETTINGS_ITEM } from '../lib/nav'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-border">
        <p className="text-sm font-extrabold tracking-[0.2em]">
          THE JOSHUA <span className="text-accent">VISION</span>
        </p>
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-text-dim">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 max-w-[85%] bg-surface border-l border-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-extrabold tracking-[0.2em]">
                THE JOSHUA <span className="text-accent">VISION</span>
              </p>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-text-dim">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-accent/10 text-accent' : 'text-text-dim hover:text-text'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-border">
              <NavLink
                to={SETTINGS_ITEM.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-text-dim hover:text-text'
                  }`
                }
              >
                <SETTINGS_ITEM.icon size={17} />
                {SETTINGS_ITEM.label}
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
