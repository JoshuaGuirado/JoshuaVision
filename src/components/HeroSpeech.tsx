import { useEffect, useMemo, useRef, useState } from 'react'
import HeroEmblem, { type EmblemId } from './HeroEmblem'
import type { HeroVoice } from '../lib/heroVoice'

/**
 * O HERÓI FALANDO COM O JOSHUA.
 *
 * Arte do personagem à esquerda, balão de fala à direita — o texto aparece
 * letra por letra, como se ele estivesse falando na hora. Clicar no balão pede
 * a próxima fala.
 *
 * Se a arte não carregar (arquivo removido, nome errado), o retrato vira o
 * emblema desenhado: a tela nunca fica quebrada nem vazia.
 */
export default function HeroSpeech({
  voice,
  emblem,
  color,
}: {
  voice: HeroVoice
  emblem: EmblemId
  color: string
}) {
  // Sorteia a arte uma vez por montagem: cada visita ao módulo traz uma foto
  // diferente do herói, sem trocar sozinha enquanto o Joshua está lendo.
  const portrait = useMemo(
    () => voice.portraits[Math.floor(Math.random() * voice.portraits.length)],
    [voice],
  )

  // Guarda QUAL arte falhou, em vez de um booleano: trocar de imagem volta a
  // tentar carregar em vez de herdar a falha anterior.
  const [failed, setFailed] = useState<string | null>(null)
  const showArt = Boolean(portrait) && failed !== portrait

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
    <div className="tjv-fade mb-6 flex items-stretch gap-3 sm:gap-4">
      {/* ---- Retrato do herói ---- */}
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border w-24 sm:w-36"
        style={{ borderColor: `${color}55`, backgroundColor: '#0b1428' }}
      >
        {showArt ? (
          <img
            src={portrait}
            alt={voice.name}
            onError={() => setFailed(portrait)}
            className="h-full w-full object-cover object-[center_22%]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center py-6">
            <HeroEmblem emblem={emblem} size={56} alive />
          </div>
        )}

        {/* véu de cor por cima da foto, para casar com a paleta do módulo */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(160deg, transparent 45%, ${color}33 100%)`,
          }}
        />
        {/* selo do emblema no canto, mesmo com foto */}
        {showArt && (
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-bg/75 p-1 backdrop-blur-sm">
            <HeroEmblem emblem={emblem} size={20} alive />
          </span>
        )}
      </div>

      {/* ---- Balão de fala ---- */}
      <button
        type="button"
        onClick={advance}
        aria-label="Ouvir outra fala do herói"
        className="group relative flex-1 min-w-0 text-left rounded-2xl border border-border-soft
                   bg-surface px-4 py-3.5 sm:px-5 sm:py-4 transition-colors hover:border-border"
      >
        {/* bico do balão apontando para a arte */}
        <span
          aria-hidden
          className="absolute left-[-7px] top-8 h-3 w-3 rotate-45 border-b border-l
                     border-border-soft bg-surface"
        />

        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color }}
        >
          {voice.name}
        </p>

        <p className="mt-1.5 text-sm sm:text-[15px] leading-relaxed text-text">
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
