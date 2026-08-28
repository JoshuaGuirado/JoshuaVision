/**
 * Avatares do esquadrão.
 *
 * São insígnias originais — escudo, martelo, punho, reator, teia — desenhadas
 * para este sistema. Carregam a estética de cada herói sem reproduzir arte
 * protegida de terceiros.
 *
 * Cada patente tem símbolo e animação próprios, para o assistente parecer vivo.
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

/** Moldura comum: disco escuro com aro na cor do herói. */
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
      <circle cx="100" cy="100" r="94" fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.5" />
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

/** Thor — o martelo com raios. */
function HammerAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#6db3f2" alive={alive}>
      <circle cx="100" cy="100" r="70" fill="#101d38" />

      {/* raios ao redor, piscando */}
      <g className={alive ? 'tjv-spark' : undefined}>
        <path d="M46 44 L62 70 L50 72 L64 96" stroke="#8fd0ff" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M154 44 L138 70 L150 72 L136 96" stroke="#8fd0ff" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>

      <g className={alive ? 'tjv-breathe' : undefined} style={{ transformOrigin: '100px 100px' }}>
        {/* cabeça do martelo */}
        <rect x="58" y="62" width="84" height="52" rx="9" fill="#c3d3e8" stroke="#7d92b3" strokeWidth="3" />
        <rect x="58" y="78" width="84" height="9" fill="#93a8c8" opacity="0.7" />
        {/* cabo */}
        <rect x="92" y="112" width="16" height="52" rx="7" fill="#8a5a34" />
        <rect x="88" y="150" width="24" height="10" rx="5" fill="#c3d3e8" />
      </g>
    </Frame>
  )
}

/** Hulk — o punho cerrado. Força bruta. */
function FistAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#4caf50" alive={alive}>
      <circle cx="100" cy="100" r="70" fill="#122a18" />
      <g className={alive ? 'tjv-smash' : undefined} style={{ transformOrigin: '100px 110px' }}>
        {/* dorso da mão */}
        <rect x="52" y="74" width="96" height="60" rx="20" fill="#4caf50" stroke="#2f7d36" strokeWidth="3" />
        {/* dedos */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={58 + i * 23}
            y="70"
            width="19"
            height="34"
            rx="9"
            fill="#5cc463"
            stroke="#2f7d36"
            strokeWidth="2.5"
          />
        ))}
        {/* polegar */}
        <rect x="48" y="104" width="34" height="19" rx="9" fill="#5cc463" stroke="#2f7d36" strokeWidth="2.5" />
        {/* punho */}
        <rect x="66" y="134" width="68" height="20" rx="9" fill="#2f7d36" />
      </g>
    </Frame>
  )
}

/** Homem de Ferro — o reator do peito. */
function ReactorAvatar({ alive }: { alive?: boolean }) {
  return (
    <Frame color="#f0a92c" alive={alive}>
      <circle cx="100" cy="100" r="70" fill="#2a1206" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#c8102e" strokeWidth="7" />

      <g className={alive ? 'tjv-orbit' : undefined} style={{ transformOrigin: '100px 100px' }}>
        {/* bobinas em volta do núcleo */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI / 4) * i
          return (
            <circle
              key={i}
              cx={100 + 40 * Math.cos(a)}
              cy={100 + 40 * Math.sin(a)}
              r="8"
              fill="#f0a92c"
              opacity="0.85"
            />
          )
        })}
      </g>

      <g className={alive ? 'tjv-glow' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="30" fill="#9fe8ff" />
        <circle cx="100" cy="100" r="20" fill="#f2fdff" />
        <polygon points={starPoints(100, 100, 15)} fill="#8fd0ff" opacity="0.75" />
      </g>
    </Frame>
  )
}

/** Homem-Aranha — a teia. O mais ágil. */
function WebAvatar({ alive }: { alive?: boolean }) {
  const rings = [26, 42, 58]
  const spokes = 8

  return (
    <Frame color="#e34a4a" alive={alive}>
      <circle cx="100" cy="100" r="70" fill="#2b0d14" />

      <g className={alive ? 'tjv-breathe' : undefined} style={{ transformOrigin: '100px 100px' }}>
        {/* raios da teia */}
        {Array.from({ length: spokes }, (_, i) => {
          const a = ((Math.PI * 2) / spokes) * i - Math.PI / 2
          return (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={100 + 66 * Math.cos(a)}
              y2={100 + 66 * Math.sin(a)}
              stroke="#f2f5fb"
              strokeWidth="3"
              strokeOpacity="0.85"
            />
          )
        })}

        {/* fios concêntricos, levemente curvados como teia de verdade */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: spokes }, (_, i) => {
              const a = ((Math.PI * 2) / spokes) * i - Math.PI / 2
              return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
            }).join(' ')}
            fill="none"
            stroke="#f2f5fb"
            strokeWidth="2.5"
            strokeOpacity="0.75"
          />
        ))}

        <circle cx="100" cy="100" r="7" fill="#e34a4a" />
      </g>
    </Frame>
  )
}

const AVATARS: Record<string, (p: { alive?: boolean }) => React.ReactElement> = {
  'claude-opus-5': ShieldAvatar,
  'claude-sonnet-5': HammerAvatar,
  'gemini-3.1-pro-preview': FistAvatar,
  'claude-haiku-4-5': ReactorAvatar,
  'gemini-3.7-flash': WebAvatar,
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
