/**
 * Identidade do THE JOSHUA VISION — tema Capitão América.
 *
 * O símbolo é o escudo: anéis vermelho/branco concêntricos, campo azul e a
 * estrela de cinco pontas no centro. Feito em SVG para escalar sem perder
 * nitidez e permitir variações sem exportar imagem nova.
 */

/** Estrela de 5 pontas centrada em (cx, cy) com raio externo r. */
function starPoints(cx: number, cy: number, r: number) {
  const inner = r * 0.382 // proporção clássica da estrela de 5 pontas
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : inner
    const angle = (Math.PI / 5) * i - Math.PI / 2
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
  }).join(' ')
}

export function LogoMark({
  size = 48,
  className,
  animated = false,
}: {
  size?: number
  className?: string
  animated?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="THE JOSHUA VISION"
    >
      <defs>
        <radialGradient id="tjv-shine" cx="32%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </radialGradient>
      </defs>

      {/* anéis do escudo, de fora para dentro */}
      <circle cx="100" cy="100" r="96" fill="#c8102e" />
      <circle cx="100" cy="100" r="76" fill="#f2f5fb" />
      <circle cx="100" cy="100" r="57" fill="#c8102e" />
      <circle cx="100" cy="100" r="38" fill="#1b4fb5" />

      <polygon points={starPoints(100, 100, 30)} fill="#f2f5fb" />

      {/* brilho metálico por cima */}
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="url(#tjv-shine)"
        className={animated ? 'tjv-spin-slow' : undefined}
        style={{ transformOrigin: '100px 100px' }}
      />
      <circle cx="100" cy="100" r="95" fill="none" stroke="#00000055" strokeWidth="2" />
    </svg>
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
