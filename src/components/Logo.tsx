import { useState } from 'react'

/**
 * IDENTIDADE DO THE JOSHUA VISION — tema Marvel.
 *
 * O símbolo do site não é mais o escudo do Capitão América: o site inteiro é
 * Marvel, e um herói só não pode representar todos. A marca agora é o "A" dos
 * Vingadores (arte que o Joshua escolheu, em `public/logos/avenger.png`),
 * dentro de um anel vermelho Marvel que gira devagar.
 *
 * Se o PNG faltar, o anel continua e aparece um "A" desenhado no lugar — a
 * marca nunca some.
 */
export function LogoMark({
  size = 48,
  className,
  animated = false,
}: {
  size?: number
  className?: string
  animated?: boolean
}) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="THE JOSHUA VISION"
    >
      {/* brasa vermelha respirando atrás da marca */}
      <span
        aria-hidden
        className={`absolute inset-0 rounded-full ${animated ? 'tjv-halo' : ''}`}
        style={{
          background: 'radial-gradient(circle, rgba(236,29,36,0.55), rgba(236,29,36,0) 70%)',
        }}
      />

      {/* anel metálico girando, como o disco de abertura da Marvel */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 h-full w-full ${animated ? 'tjv-spin-slow' : ''}`}
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#ec1d24"
          strokeWidth="4"
          strokeDasharray="52 16 22 16"
          strokeLinecap="round"
        />
      </svg>

      {failed ? (
        <span
          className="relative font-black leading-none text-accent"
          style={{ fontSize: size * 0.56 }}
        >
          A
        </span>
      ) : (
        <img
          src="/logos/avenger.png"
          alt=""
          onError={() => setFailed(true)}
          className="relative object-contain"
          style={{
            width: size * 0.66,
            height: size * 0.66,
            filter: 'drop-shadow(0 0 5px rgba(236,29,36,0.75)) brightness(1.35)',
          }}
        />
      )}
    </span>
  )
}

/** "THE JOSHUA VISION" em letreiro espaçado. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-[0.26em] whitespace-nowrap ${className ?? ''}`}>
      <span className="text-text">THE JOSHUA </span>
      <span className="text-accent">VISION</span>
    </span>
  )
}

/** Versão completa usada na tela de acesso. */
export function LogoFull({ markSize = 128 }: { markSize?: number }) {
  return (
    <div className="flex flex-col items-center">
      <LogoMark size={markSize} animated />

      <p className="mt-7 text-[15px] sm:text-lg font-extrabold tracking-[0.28em] whitespace-nowrap">
        <span className="text-text">THE JOSHUA </span>
        <span className="text-accent">VISION</span>
      </p>

      <div className="mt-3 flex items-center gap-3 w-full max-w-[268px]">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/60" />
        <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-text-dim whitespace-nowrap">
          YOUR LIFE. YOUR VISION.
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/60" />
      </div>
    </div>
  )
}
