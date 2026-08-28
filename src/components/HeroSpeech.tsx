import { useEffect, useMemo, useRef, useState } from 'react'
import type { EmblemId } from './HeroEmblem'
import HeroLogo from './HeroLogo'
import type { HeroVoice } from '../lib/heroVoice'

/**
 * O HERÓI FALANDO COM O JOSHUA.
 *
 * Arte do personagem à esquerda, balão de fala à direita — o texto aparece
 * letra por letra, como se ele estivesse falando na hora. Clicar no balão pede
 * a próxima fala.
 *
 * A arte vem pronta do `Layout`, para o herói do balão ser exatamente o mesmo
 * que está ao fundo da tela. Se a imagem não carregar, sobra a logo oficial
 * dele — a tela nunca fica quebrada nem vazia.
 */
export default function HeroSpeech({
  voice,
  portrait,
  logo,
  emblem,
  color,
  invertLogo,
}: {
  voice: HeroVoice
  portrait: string
  logo: string
  emblem: EmblemId
  color: string
  invertLogo?: boolean
}) {
  // Guarda QUAL arte falhou, em vez de um booleano: trocar de imagem volta a
  // tentar carregar em vez de herdar a falha anterior.
  const [failed, setFailed] = useState<string | null>(null)
  const showArt = failed !== portrait

  // A saudação é sempre a primeira; as outras entram quando o Joshua clica.
  const script = useMemo(() => [voice.greeting, ...voice.lines], [voice])
  const [index, setIndex] = useState(0)
  const full = script[index] ?? voice.greeting

  const [typed, setTyped] = useState('')
  const done = typed.length === full.length
  const timer = useRef<number | undefined>(undefined)

  // Máquina de escrever. Se o Joshua clicar no meio, o efeito completa a frase
  // na hora em vez de fazer ele esperar.
  useEffect(() => {
    setTyped('')
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      setTyped(full.slice(0, i))
      if (i >= full.length) window.clearInterval(timer.current)
    }, 26)
    return () => window.clearInterval(timer.current)
  }, [full])

  function advance() {
    if (!done) {
      window.clearInterval(timer.current)
      setTyped(full)
      return
    }
    setIndex((i) => (i + 1) % script.length)
  }

  return (
    <div className="tjv-fade mb-7 flex items-end gap-3 sm:gap-5">
      {/* ---- O herói ao lado da fala ----
           As artes são cenas inteiras (não recortes do personagem), então elas
           ficam numa moldura alta com a cor do herói e um degradê por baixo —
           é o que fica bonito sem recorte. Quem dá o efeito de "personagem na
           tela" é a arte grande e transparente ao fundo, no Layout. */}
      <div
        className="relative shrink-0 w-28 sm:w-44 aspect-[3/4] overflow-hidden rounded-2xl border"
        style={{ borderColor: `${color}66`, boxShadow: `0 14px 34px -12px ${color}80` }}
      >
        {showArt ? (
          <img
            src={portrait}
            alt={voice.name}
            onError={() => setFailed(portrait)}
            className="tjv-arrive h-full w-full object-cover object-[center_20%]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <HeroLogo logo={logo} emblem={emblem} color={color} invert={invertLogo} size={64} />
          </div>
        )}

        {/* funde a arte no fundo da página em vez de cortar seco */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 45%, ${color}22 72%, rgba(8,9,12,0.92) 100%)`,
          }}
        />

        {/* logo oficial do herói selada no canto da moldura */}
        <span className="absolute bottom-1.5 right-1.5">
          <HeroLogo
            logo={logo}
            emblem={emblem}
            color={color}
            invert={invertLogo}
            size={26}
            halo={false}
          />
        </span>
      </div>

      {/* ---- Balão de fala ---- */}
      <button
        type="button"
        onClick={advance}
        aria-label="Ouvir outra fala do herói"
        className="group relative flex-1 min-w-0 mb-3 text-left rounded-2xl border
                   bg-surface/85 backdrop-blur-sm px-4 py-3.5 sm:px-5 sm:py-4
                   transition-colors"
        style={{ borderColor: `${color}44` }}
      >
        {/* bico do balão apontando para o herói */}
        <span
          aria-hidden
          className="absolute left-[-7px] bottom-7 h-3 w-3 rotate-45 border-b border-l
                     bg-surface"
          style={{ borderColor: `${color}44` }}
        />

        <span className="flex items-center gap-2">
          <HeroLogo
            logo={logo}
            emblem={emblem}
            color={color}
            invert={invertLogo}
            size={20}
            halo={false}
            float={false}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color }}
          >
            {voice.name}
          </span>
        </span>

        <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-text">
          {typed}
          {!done && (
            <span
              className="tjv-pulse ml-0.5 inline-block h-[1em] w-[2px] align-[-0.1em]"
              style={{ backgroundColor: color }}
            />
          )}
        </p>

        <p className="mt-2 text-[10px] text-text-faint opacity-0 transition-opacity group-hover:opacity-100">
          {done ? 'toque para ouvir mais' : 'toque para completar'}
        </p>
      </button>
    </div>
  )
}
