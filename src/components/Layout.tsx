import { useMemo } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { findModule } from '../lib/nav'
import { heroVoiceFor } from '../lib/heroVoice'
import { LogoMark } from './Logo'
import HeroLogo from './HeroLogo'
import HeroSpeech from './HeroSpeech'

/**
 * Casca das telas internas. A Home fica fora daqui de propósito — lá o Joshua
 * quer só os quadradinhos, sem navegação lateral.
 *
 * Cada módulo é do seu herói: a arte dele ocupa o fundo da tela em
 * transparência, ele aparece de corpo inteiro ao lado do balão de fala e a
 * cor do módulo tinge as bordas. A arte é sorteada aqui uma vez e vai para os
 * dois lugares, para o herói do fundo ser o mesmo que está falando.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const active = findModule(pathname)
  const voice = active ? heroVoiceFor(active.path) : undefined

  const portrait = useMemo(() => {
    if (!voice) return undefined
    return voice.portraits[Math.floor(Math.random() * voice.portraits.length)]
  }, [voice])

  return (
    <div className="min-h-svh">
      {/* ---- Arte do herói ao fundo de toda a tela ---- */}
      {portrait && active && (
        <div aria-hidden className="tjv-fade pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <img
            key={portrait}
            src={portrait}
            alt=""
            className="tjv-arrive absolute right-0 top-0 h-full w-full object-cover
                       sm:w-[62%] opacity-[0.26] sm:opacity-[0.32]"
            style={{
              // artes claras (Visão, F.R.I.D.A.Y.) chegavam a ofuscar o texto:
              // baixar o contraste e a saturação mantém a presença sem atrapalhar
              filter: 'saturate(0.85) contrast(0.9)',
              maskImage:
                'linear-gradient(to left, black 8%, rgba(0,0,0,0.4) 55%, transparent 92%)',
              WebkitMaskImage:
                'linear-gradient(to left, black 8%, rgba(0,0,0,0.4) 55%, transparent 92%)',
            }}
          />
          {/* escurece por baixo para o texto continuar legível */}
          <span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(8,9,12,0.62) 0%, rgba(8,9,12,0.35) 30%, rgba(8,9,12,0.9) 100%)',
            }}
          />
          {/* respiro na cor do herói */}
          <span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(50rem 30rem at 90% 0%, ${active.color}1f, transparent 68%)`,
            }}
          />
        </div>
      )}

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
              <HeroLogo
                logo={active.logo}
                emblem={active.emblem}
                color={active.color}
                invert={active.invertLogo}
                size={30}
                float={false}
              />
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
            <LogoMark size={30} animated />
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-7 sm:py-10">
        {/* O herói do módulo recebe o Joshua em toda tela interna.
            A `key` reinicia a fala ao trocar de módulo. */}
        {active && voice && portrait && (
          <HeroSpeech
            key={active.path}
            voice={voice}
            portrait={portrait}
            logo={active.logo}
            emblem={active.emblem}
            color={active.color}
            invertLogo={active.invertLogo}
          />
        )}

        <Outlet />
      </main>
    </div>
  )
}
