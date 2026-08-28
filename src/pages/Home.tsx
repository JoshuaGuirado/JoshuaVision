import { LogOut } from 'lucide-react'
import { MODULES } from '../lib/nav'
import { LogoMark } from '../components/Logo'
import ModuleCard from '../components/ModuleCard'
import { useStats, resumoDoModulo } from '../lib/useStats'
import { useAuth } from '../contexts/AuthContext'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Home() {
  const { signOut } = useAuth()
  const { stats, loading } = useStats()

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
          <p className="text-text-dim text-sm mt-2 first-letter:uppercase">{dateLabel}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MODULES.map((modulo, i) => (
            <ModuleCard
              key={modulo.path}
              modulo={modulo}
              resumo={loading ? undefined : resumoDoModulo(modulo.path, stats)}
              atraso={120 + i * 45}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
