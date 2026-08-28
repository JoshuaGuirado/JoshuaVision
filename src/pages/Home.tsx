import { Link } from 'react-router-dom'
import { HOME_MODULES } from '../lib/nav'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning, Joshua.'
  if (hour < 18) return 'Good afternoon, Joshua.'
  return 'Good evening, Joshua.'
}

export default function Home() {
  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold">{greeting()}</h1>
        <p className="text-text-dim text-sm capitalize mt-1.5">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {HOME_MODULES.map(({ path, label, icon: Icon, implemented }) => (
          <Link
            key={path}
            to={path}
            className="group relative aspect-[4/3] rounded-2xl border border-border bg-surface
                       flex flex-col items-center justify-center gap-3
                       hover:border-accent/50 hover:bg-surface-2
                       transition-all duration-200 hover:-translate-y-0.5"
          >
            {!implemented && (
              <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-text-dim/40" />
            )}

            <Icon
              size={26}
              strokeWidth={1.5}
              className="text-text-dim group-hover:text-accent transition-colors duration-200"
            />
            <span className="text-sm font-medium tracking-wide">{label}</span>
          </Link>
        ))}
      </div>

      <p className="text-text-dim/60 text-xs mt-8 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-text-dim/40" />
        Módulos ainda em desenvolvimento
      </p>
    </div>
  )
}
