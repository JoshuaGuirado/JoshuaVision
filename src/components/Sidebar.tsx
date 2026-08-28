import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, SETTINGS_ITEM } from '../lib/nav'
import { LogoMark } from './Logo'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-border bg-surface/40">
      <div className="px-5 py-6 flex items-center gap-3">
        <LogoMark size={34} />
        <p className="text-[11px] font-extrabold tracking-[0.2em] leading-tight">
          THE JOSHUA
          <br />
          <span className="text-accent">VISION</span>
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-dim hover:text-text hover:bg-surface-2'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <NavLink
          to={SETTINGS_ITEM.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-accent/10 text-accent' : 'text-text-dim hover:text-text hover:bg-surface-2'
            }`
          }
        >
          <SETTINGS_ITEM.icon size={17} />
          {SETTINGS_ITEM.label}
        </NavLink>
      </div>
    </aside>
  )
}
