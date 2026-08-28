import { Link } from 'react-router-dom'
import type { NavItem } from '../lib/nav'
import { heroVoiceFor } from '../lib/heroVoice'
import { useTilt } from '../lib/useParallax'
import HeroLogo from './HeroLogo'

/**
 * O QUADRADINHO DE CADA MÓDULO NA HOME.
 *
 * Traz a arte do herói ao fundo, a logo oficial dele, e — quando existe — o
 * número real do módulo ("3 pendentes", "R$ 1.240 no mês"), para o Joshua
 * saber onde precisa entrar antes de clicar.
 *
 * No computador o cartão inclina em 3D seguindo o mouse, com um brilho que
 * acompanha o cursor. No celular ele fica parado: não há ponteiro para seguir.
 */
export default function ModuleCard({
  modulo,
  resumo,
  atraso,
}: {
  modulo: NavItem
  resumo?: string
  /** Atraso da animação de entrada, para os cartões surgirem em cascata. */
  atraso: number
}) {
  const { path, label, hero, emblem, logo, invertLogo, description, color } = modulo
  const { props, tilt } = useTilt<HTMLAnchorElement>()
  const arte = heroVoiceFor(path)?.portraits[0]

  return (
    <Link
      to={path}
      {...props}
      style={{
        animationDelay: `${atraso}ms`,
        transform: tilt.ativo
          ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-4px) scale(1.02)`
          : undefined,
        transformStyle: 'preserve-3d',
      }}
      className="tjv-rise group relative overflow-hidden rounded-2xl p-5 sm:p-6
                 border border-border-soft bg-surface
                 hover:border-border transition-transform duration-200
                 aspect-[4/3] sm:aspect-square lg:aspect-[4/3]
                 flex flex-col justify-between"
    >
      {/* o próprio herói no cartão: discreto em repouso, aparece no hover */}
      {arte && (
        <img
          aria-hidden
          src={arte}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_18%]
                     opacity-[0.22] group-hover:opacity-45 group-hover:scale-110
                     transition-all duration-500"
          style={{
            maskImage: 'linear-gradient(to top, transparent 12%, black 88%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 12%, black 88%)',
          }}
        />
      )}

      {/* escurece a arte para o nome do módulo continuar legível */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,9,12,0.35) 0%, rgba(8,9,12,0.62) 55%, rgba(8,9,12,0.92) 100%)',
        }}
      />

      {/* brilho seguindo o cursor, como um card holográfico */}
      <span
        aria-hidden
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.ativo ? 0.5 : 0,
          background: `radial-gradient(12rem 9rem at ${tilt.mx}% ${tilt.my}%, ${color}55, transparent 70%)`,
        }}
      />

      {/* halo do módulo — discreto em repouso, acende no hover */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.12] group-hover:opacity-[0.28] transition-opacity duration-300"
        style={{
          background: `radial-gradient(18rem 12rem at 100% 0%, ${color}, transparent 70%)`,
        }}
      />

      {/* linha superior que desliza no hover, na cor do herói */}
      <span
        aria-hidden
        className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span className="inline-block transition-transform duration-300 group-hover:scale-110">
          <HeroLogo logo={logo} emblem={emblem} color={color} invert={invertLogo} size={46} />
        </span>

        {/* o número do módulo, quando há algo para contar */}
        {resumo && (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap
                       backdrop-blur-sm"
            style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}
          >
            {resumo}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <p className="font-semibold text-[0.95rem] leading-tight">{label}</p>
        <p className="text-[11px] mt-1 font-medium tracking-wide" style={{ color }}>
          {hero}
        </p>
        <p className="text-text-faint text-xs mt-1 leading-snug hidden sm:block">{description}</p>
      </div>
    </Link>
  )
}
