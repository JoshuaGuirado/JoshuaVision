import { useState } from 'react'
import HeroEmblem, { type EmblemId } from './HeroEmblem'

/**
 * A LOGO OFICIAL DO HERÓI, COM EFEITO.
 *
 * Usa os PNGs sem fundo de `public/logos/`. Toda logo ganha o mesmo tratamento:
 * um halo na cor do herói pulsando atrás, flutuação leve e um giro/aumento
 * quando o Joshua passa o mouse (ou toca) no cartão.
 *
 * Se o PNG faltar, cai no emblema desenhado — a tela nunca fica vazia.
 */
export default function HeroLogo({
  logo,
  emblem,
  color,
  size = 44,
  invert = false,
  halo = true,
  float = true,
  className = '',
}: {
  logo: string
  emblem: EmblemId
  color: string
  size?: number
  /** Logo preta precisa virar clara para aparecer no fundo escuro. */
  invert?: boolean
  /** Halo colorido atrás da logo. */
  halo?: boolean
  /** Flutuação contínua. Desligue em espaços apertados (cabeçalho). */
  float?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) return <HeroEmblem emblem={emblem} size={size} alive className={className} />

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {halo && (
        <span
          aria-hidden
          className="tjv-halo absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}66, ${color}00 68%)`,
          }}
        />
      )}
      <img
        src={logo}
        alt=""
        onError={() => setFailed(true)}
        className={`relative h-full w-full object-contain ${float ? 'tjv-hover' : ''}`}
        style={{
          filter: invert
            ? `invert(1) drop-shadow(0 0 6px ${color}99)`
            : `drop-shadow(0 0 6px ${color}80)`,
        }}
      />
    </span>
  )
}
