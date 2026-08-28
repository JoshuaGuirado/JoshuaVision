import { useState } from 'react'
import HeroEmblem, { type EmblemId } from './HeroEmblem'

/**
 * Faixa de identidade do módulo.
 *
 * Quando existe arte em `public/herois/`, ela ocupa a direita do banner e some
 * atrás de um degradê para o texto continuar legível. Se o arquivo não existir,
 * o banner cai no emblema desenhado sem quebrar a tela.
 */
export default function HeroBanner({
  hero,
  emblem,
  color,
  image,
  tagline,
}: {
  hero: string
  emblem: EmblemId
  color: string
  /** Caminho a partir de /public, ex: "/herois/capitao-1.jpg" */
  image?: string
  tagline?: string
}) {
  // Guarda QUAL arte falhou, em vez de um booleano: assim trocar de imagem
  // volta a tentar carregar, em vez de herdar a falha da anterior.
  const [failed, setFailed] = useState<string | null>(null)
  const showImage = Boolean(image) && failed !== image

  return (
    <div
      className="tjv-fade relative overflow-hidden rounded-2xl border border-border-soft mb-6
                 h-36 sm:h-44"
      style={{ backgroundColor: '#0b1428' }}
    >
      {showImage && (
        <img
          src={image}
          alt=""
          onError={() => setFailed(image ?? null)}
          className="absolute right-0 top-0 h-full w-[52%] sm:w-1/2 object-cover object-[center_18%]"
        />
      )}

      {/* degradê que funde a arte no fundo e protege a leitura do texto.
          No celular a faixa sólida é mais larga: sobra menos espaço, então o
          texto passaria por cima da arte. */}
      <span
        aria-hidden
        className="absolute inset-0 sm:hidden"
        style={{
          background: showImage
            ? `linear-gradient(90deg, #0b1428 52%, ${color}26 76%, transparent 96%)`
            : `linear-gradient(100deg, #0b1428 30%, ${color}26 100%)`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 hidden sm:block"
        style={{
          background: showImage
            ? `linear-gradient(90deg, #0b1428 34%, ${color}26 62%, transparent 88%)`
            : `linear-gradient(100deg, #0b1428 30%, ${color}26 100%)`,
        }}
      />
      {/* brilho de baixo, para a arte não terminar em corte seco */}
      {showImage && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: 'linear-gradient(0deg, #0b1428, transparent)' }}
        />
      )}

      <div className="relative h-full flex items-center gap-4 p-5">
        <HeroEmblem emblem={emblem} size={52} alive className="shrink-0" />
        {/* a largura é limitada para o texto não invadir a arte no celular */}
        <div className="min-w-0 max-w-[7.5rem] sm:max-w-[46%]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Módulo de</p>
          <p
            className="font-extrabold text-lg sm:text-2xl leading-[1.15]"
            style={{ color }}
          >
            {hero}
          </p>
          {tagline && (
            <p className="text-text-dim text-[11px] sm:text-xs mt-1 leading-snug hidden sm:block">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
