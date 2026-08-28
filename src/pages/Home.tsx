import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { MODULES } from '../lib/nav'
import { LogoMark } from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { signOut } = useAuth()

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-svh px-5 py-8 sm:px-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-start justify-between mb-12 sm:mb-16">
          <div className="flex items-center gap-4">
            <LogoMark size={46} />
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] leading-tight">
                THE JOSHUA
                <br />
                <span className="text-accent">VISION</span>
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="text-text-faint hover:text-text-dim transition-colors p-2 -mr-2"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold leading-tight tracking-tight">
            {greeting()},{' '}
            <span className="bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
              Joshua
            </span>
            .
          </h1>
          <p className="text-text-dim text-sm mt-2 capitalize">{dateLabel}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MODULES.map(({ path, label, icon: Icon, description, color }, i) => (
            <Link
              key={path}
              to={path}
              style={{ animationDelay: `${i * 45}ms` }}
              className="tjv-rise group relative overflow-hidden rounded-2xl p-5 sm:p-6
                         border border-border-soft bg-surface
                         hover:border-border transition-all duration-300
                         hover:-translate-y-1 min-h-[7.5rem] sm:min-h-[9rem]
                         flex flex-col justify-between"
            >
              {/* halo colorido do módulo — sutil em repouso, acende no hover */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.16] transition-opacity duration-300"
                style={{
                  background: `radial-gradient(18rem 12rem at 100% 0%, ${color}, transparent 70%)`,
                }}
              />

              <div className="relative">
                <span
                  className="inline-flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl items-center justify-center
                             transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: `${color}1a`,
                    color,
                    boxShadow: `inset 0 0 0 1px ${color}26`,
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </span>
              </div>

              <div className="relative mt-4">
                <p className="font-semibold text-[0.95rem] leading-tight">{label}</p>
                <p className="text-text-faint text-xs mt-1 leading-snug hidden sm:block">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
