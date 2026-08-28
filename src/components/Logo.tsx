/**
 * Identidade do THE JOSHUA VISION.
 *
 * O monograma é um TJV entrelaçado dentro de um anel partido: metade prata
 * (T e J), metade dourada (V). Recriado em SVG para escalar sem perder
 * qualidade e permitir variações sem exportar arquivos novos.
 */

const SILVER_ID = 'tjv-silver'
const GOLD_ID = 'tjv-gold'

function Defs() {
  return (
    <defs>
      <linearGradient id={SILVER_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#d9d9d9" />
        <stop offset="55%" stopColor="#8f8f8f" />
        <stop offset="100%" stopColor="#e6e6e6" />
      </linearGradient>
      <linearGradient id={GOLD_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f7dfa0" />
        <stop offset="45%" stopColor="#d4a53c" />
        <stop offset="55%" stopColor="#a97c1d" />
        <stop offset="100%" stopColor="#e9c877" />
      </linearGradient>
    </defs>
  )
}

/** Monograma TJV dentro do anel — usado em favicon, sidebar e espaços pequenos. */
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="THE JOSHUA VISION"
    >
      <Defs />

      {/* anel partido: metade esquerda prata, metade direita dourada */}
      <path
        d="M100 18 A82 82 0 0 0 100 182"
        fill="none"
        stroke={`url(#${SILVER_ID})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M100 18 A82 82 0 0 1 100 182"
        fill="none"
        stroke={`url(#${GOLD_ID})`}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* V dourado, atrás */}
      <path
        d="M108 58 L132 148 L156 58"
        fill="none"
        stroke={`url(#${GOLD_ID})`}
        strokeWidth="17"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />

      {/* T prata */}
      <path
        d="M46 58 H128 M87 58 V132"
        fill="none"
        stroke={`url(#${SILVER_ID})`}
        strokeWidth="14"
        strokeLinecap="butt"
      />

      {/* J prata — desce do T e curva à esquerda */}
      <path
        d="M87 108 V128 A22 22 0 0 1 65 150 A22 22 0 0 1 47 140"
        fill="none"
        stroke={`url(#${SILVER_ID})`}
        strokeWidth="14"
        strokeLinecap="butt"
      />
    </svg>
  )
}

/** "THE JOSHUA VISION" em letreiro espaçado — para cabeçalhos e a sidebar. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-[0.28em] whitespace-nowrap ${className ?? ''}`}>
      <span className="text-text">THE JOSHUA </span>
      <span className="text-accent">VISION</span>
    </span>
  )
}

/** Versão completa: monograma + letreiro + assinatura. Usada na tela de acesso. */
export function LogoFull({ markSize = 132 }: { markSize?: number }) {
  return (
    <div className="flex flex-col items-center">
      <LogoMark size={markSize} />

      <p className="mt-6 text-[15px] sm:text-lg font-extrabold tracking-[0.3em] whitespace-nowrap">
        <span className="text-text">THE JOSHUA </span>
        <span className="text-accent">VISION</span>
      </p>

      <div className="mt-3 flex items-center gap-3 w-full max-w-[260px]">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
        <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-text-dim whitespace-nowrap">
          YOUR LIFE. YOUR VISION.
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
      </div>
    </div>
  )
}
