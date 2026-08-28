/**
 * Avatares do esquadrão.
 *
 * São insígnias originais — escudo, asas, braço metálico, ampulheta, alvo —
 * desenhadas para este sistema. Não reproduzem personagens de terceiros:
 * carregam a estética heroica sem copiar arte protegida.
 *
 * Cada patente tem um símbolo próprio, e todos animam sutilmente para o
 * assistente parecer vivo.
 */

type AvatarProps = {
  size?: number
  /** Liga as animações — desligado em listas para não pesar. */
  alive?: boolean
  className?: string
}

function starPoints(cx: number, cy: number, r: number) {
  const inner = r * 0.382
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : inner
    const angle = (Math.PI / 5) * i - Math.PI / 2
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
  }).join(' ')
}

/** Moldura comum: disco escuro com aro na cor da patente. */
function Frame({
  color,
  children,
  alive,
}: {
  color: string
  children: React.ReactNode
  alive?: boolean
}) {
  return (
    <>
      <circle cx="100" cy="100" r="96" fill="#0b1428" />
      <circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.55"
      />
      {alive && (
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="26 560"
          className="tjv-orbit"
          style={{ transformOrigin: '100px 100px' }}
        />
      )}
      {children}
    </>
  )
}

/** Capitão América — o escudo. Patente máxima. */
function ShieldAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#e0263c" alive={alive}>
      <g className={alive ? 'tjv-breathe' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="72" fill="#c8102e" />
        <circle cx="100" cy="100" r="57" fill="#f2f5fb" />
        <circle cx="100" cy="100" r="43" fill="#c8102e" />
        <circle cx="100" cy="100" r="29" fill="#1b4fb5" />
        <polygon points={starPoints(100, 100, 23)} fill="#f2f5fb" />
      </g>
    </Frame>
  )
}

/** Falcão — asas abertas. Ágil, segundo em patente. */
function WingsAvatar({ alive }: { alive?: boolean }) {
  const feather = (x: number, y: number, len: number, tilt: number, dir: number) => (
    <rect
      key={`${x}-${y}`}
      x={x}
      y={y}
      width={len}
      height="7"
      rx="3.5"
      fill="#c9d6ee"
      transform={`rotate(${tilt * dir} ${x + (dir > 0 ? 0 : len)} ${y + 3.5})`}
    />
  )

  return (
    <Frame color="#2f6df0" alive={alive}>
      <g className={alive ? 'tjv-flap' : undefined} style={{ transformOrigin: '100px 104px' }}>
        {/* asa esquerda */}
        <g>
          {feather(28, 78, 54, 12, 1)}
          {feather(24, 94, 62, 4, 1)}
          {feather(30, 110, 52, -8, 1)}
        </g>
        {/* asa direita (espelhada) */}
        <g transform="translate(200,0) scale(-1,1)">
          {feather(28, 78, 54, 12, 1)}
          {feather(24, 94, 62, 4, 1)}
          {feather(30, 110, 52, -8, 1)}
        </g>
      </g>
      <circle cx="100" cy="100" r="26" fill="#e0263c" />
      <polygon points={starPoints(100, 100, 17)} fill="#f2f5fb" />
    </Frame>
  )
}

/** Viúva Negra — a ampulheta. Estrategista. */
function HourglassAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#a8bbdd" alive={alive}>
      <circle cx="100" cy="100" r="66" fill="#131c33" />
      <g className={alive ? 'tjv-breathe' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <path d="M72 56 H128 L104 100 L128 144 H72 L96 100 Z" fill="#e0263c" />
        <path d="M84 66 H116 L100 96 Z" fill="#ff7b88" opacity="0.55" />
      </g>
    </Frame>
  )
}

/** Soldado Invernal — braço metálico com a estrela. Rápido e direto. */
function MetalArmAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#7f93bb" alive={alive}>
      <circle cx="100" cy="100" r="66" fill="#131c33" />
      <g className={alive ? 'tjv-breathe' : undefined} style={{ transformOrigin: '100px 100px' }}>
        {/* placas metálicas empilhadas */}
        {[52, 74, 96, 118].map((y, i) => (
          <rect
            key={y}
            x={48 + i * 2}
            y={y}
            width={104 - i * 4}
            height="16"
            rx="8"
            fill="#9db0d4"
            stroke="#5c6f96"
            strokeWidth="1.5"
          />
        ))}
        <polygon points={starPoints(100, 100, 26)} fill="#e0263c" />
      </g>
    </Frame>
  )
}

/** Agente 13 — o alvo. O mais veloz. */
function TargetAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#5b93ff" alive={alive}>
      <circle cx="100" cy="100" r="66" fill="#131c33" />
      <g className={alive ? 'tjv-ping' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="58" fill="none" stroke="#5b93ff" strokeWidth="5" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#8fb4ff" strokeWidth="5" />
        <circle cx="100" cy="100" r="22" fill="none" stroke="#c9dcff" strokeWidth="5" />
      </g>
      <polygon points={starPoints(100, 100, 13)} fill="#f2f5fb" />
    </Frame>
  )
}

const AVATARS: Record<string, (p: { alive?: boolean }) => React.ReactElement> = {
  'claude-opus-5': ShieldAvatar,
  'claude-sonnet-5': WingsAvatar,
  'gemini-3.1-pro-preview': HourglassAvatar,
  'claude-haiku-4-5': MetalArmAvatar,
  'gemini-3.7-flash': TargetAvatar,
}

export default function HeroAvatar({
  modelId,
  size = 64,
  alive = false,
  className,
}: { modelId: string } & AvatarProps) {
  const Avatar = AVATARS[modelId] ?? ShieldAvatar

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <Avatar alive={alive} />
    </svg>
  )
}
