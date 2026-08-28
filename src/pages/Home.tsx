import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { MODULES } from '../lib/nav'
import { LogoMark } from '../components/Logo'
import HeroEmblem from '../components/HeroEmblem'
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
        <header className="tjv-fade flex items-center justify-between mb-12 sm:mb-16">
          <div className="flex items-center gap-3.5">
            <LogoMark size={44} />
            <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] leading-tight">
              THE JOSHUA
              <br />
              <span className="text-accent">VISION</span>
            </p>
          </div>

          <button
            onClick={signOut}
            className="text-text-faint hover:text-accent transition-colors p-2 -mr-2"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="tjv-fade mb-10 sm:mb-12" style={{ animationDelay: '80ms' }}>
          <h1 className="text-3xl sm:text-[2.7rem] font-bold leading-tight tracking-tight">
            {greeting()},{' '}
            <span className="bg-gradient-to-r from-accent-light via-accent to-cap bg-clip-text text-transparent">
              Joshua
            </span>
            .
          </h1>
          <p className="text-text-dim text-sm mt-2 capitalize">{dateLabel}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MODULES.map(({ path, label, hero, emblem, description, color }, i) => (
            <Link
              key={path}
              to={path}
              style={{ animationDelay: `${120 + i * 45}ms` }}
              className="tjv-rise group relative overflow-hidden rounded-2xl p-5 sm:p-6
                         border border-border-soft bg-surface
                         hover:border-border transition-all duration-300
                         hover:-translate-y-1 aspect-[4/3] sm:aspect-square lg:aspect-[4/3]
                         flex flex-col justify-between"
            >
              {/* halo do módulo — discreto em repouso, acende no hover */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.09] group-hover:opacity-[0.22] transition-opacity duration-300"
                style={{
                  background: `radial-gradient(18rem 12rem at 100% 0%, ${color}, transparent 70%)`,
                }}
              />
              {/* linha superior que desliza no hover, como a listra do escudo */}
              <span
                aria-hidden
                className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: color }}
              />

              <div className="relative">
                <span className="inline-block transition-transform duration-300 group-hover:scale-110">
                  <HeroEmblem emblem={emblem} size={44} alive />
                </span>
              </div>

              <div className="relative mt-4">
                <p className="font-semibold text-[0.95rem] leading-tight">{label}</p>
                <p
                  className="text-[11px] mt-1 font-medium tracking-wide"
                  style={{ color }}
                >
                  {hero}
                </p>
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
