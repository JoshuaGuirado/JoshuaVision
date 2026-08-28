import { useState } from 'react'
import HeroEmblem, { type EmblemId } from './HeroEmblem'

/**
 * Faixa de identidade do módulo.
 *
 * Se houver uma arte em `public/herois/`, ela aparece como fundo; caso o arquivo
 * não exista, o banner cai no emblema desenhado sem quebrar a tela — assim o
 * módulo funciona antes e depois de o Joshua salvar as imagens.
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
  /** Caminho a partir de /public, ex: "/herois/capitao-1.png" */
  image?: string
  tagline?: string
}) {
  const [imageOk, setImageOk] = useState(Boolean(image))

  return (
    <div
      className="tjv-fade relative overflow-hidden rounded-2xl border border-border-soft mb-6"
      style={{ backgroundColor: '#0b1428' }}
    >
      {image && imageOk && (
        <img
          src={image}
          alt=""
          onError={() => setImageOk(false)}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-45"
        />
      )}

      {/* véu que garante leitura do texto sobre qualquer arte */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(100deg, #0b1428 22%, ${color}22 60%, transparent 100%)`,
        }}
      />

      <div className="relative flex items-center gap-4 p-5">
        <HeroEmblem emblem={emblem} size={54} alive />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Módulo de</p>
          <p className="font-bold text-lg leading-tight truncate" style={{ color }}>
            {hero}
          </p>
          {tagline && <p className="text-text-dim text-xs mt-0.5">{tagline}</p>}
        </div>
      </div>
    </div>
  )
}
