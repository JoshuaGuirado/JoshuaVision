/**
 * Emblemas do universo do sistema.
 *
 * Todos são desenhos originais — escudo, martelo, punho, reator, teia, portal,
 * alvo, garras, gema, hexágono, núcleo, águia. Carregam a estética heroica sem
 * reproduzir arte protegida de terceiros, o que importa porque o site é público.
 *
 * Cada emblema anima sozinho, para as telas terem vida.
 */

export type EmblemId =
  | 'shield'
  | 'hammer'
  | 'fist'
  | 'reactor'
  | 'web'
  | 'portal'
  | 'arrow'
  | 'claws'
  | 'gem'
  | 'hex'
  | 'core'
  | 'eagle'

type Props = {
  emblem: EmblemId
  size?: number
  /** Liga as animações — desligue em listas longas. */
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

const breathe = (alive?: boolean) => ({
  className: alive ? 'tjv-breathe' : undefined,
  style: { transformOrigin: '100px 100px' },
})

/* ---------- emblemas ---------- */

/** Escudo arremessado: gira e leva um brilho passando por cima. */
function Shield({ alive }: { alive?: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="tjv-shield-sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="tjv-shield-clip">
          <circle cx="100" cy="100" r="72" />
        </clipPath>
      </defs>

      <g
        className={alive ? 'tjv-throw' : undefined}
        style={{ transformOrigin: '100px 100px' }}
      >
        <circle cx="100" cy="100" r="72" fill="#c8102e" />
        <circle cx="100" cy="100" r="57" fill="#f2f5fb" />
        <circle cx="100" cy="100" r="43" fill="#c8102e" />
        <circle cx="100" cy="100" r="29" fill="#1b4fb5" />
        <polygon points={starPoints(100, 100, 23)} fill="#f2f5fb" />
      </g>

      {/* reflexo metálico que atravessa o escudo */}
      <g clipPath="url(#tjv-shield-clip)">
        <rect
          x="-100"
          y="20"
          width="120"
          height="160"
          fill="url(#tjv-shield-sweep)"
          className={alive ? 'tjv-sweep' : undefined}
        />
      </g>
    </>
  )
}

/** Martelo com tempestade: três raios disparam em tempos diferentes. */
function Hammer({ alive }: { alive?: boolean }) {
  const bolts = [
    { d: 'M40 40 L58 68 L45 71 L60 96', delay: '0ms' },
    { d: 'M160 40 L142 68 L155 71 L140 96', delay: '700ms' },
    { d: 'M100 22 L92 44 L106 46 L96 70', delay: '1400ms' },
  ]

  return (
    <>
      <g>
        {bolts.map((b) => (
          <path
            key={b.d}
            d={b.d}
            stroke="#8fd0ff"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            className={alive ? 'tjv-bolt' : undefined}
            style={{ animationDelay: b.delay }}
          />
        ))}
      </g>

      <g {...breathe(alive)}>
        <rect x="56" y="62" width="88" height="54" rx="10" fill="#c3d3e8" stroke="#7d92b3" strokeWidth="3" />
        <rect x="56" y="80" width="88" height="9" fill="#93a8c8" opacity="0.7" />
        <rect x="92" y="114" width="16" height="52" rx="7" fill="#8a5a34" />
        <rect x="86" y="152" width="28" height="11" rx="5" fill="#c3d3e8" />
      </g>
    </>
  )
}

function Fist({ alive }: { alive?: boolean }) {
  return (
    <g className={alive ? 'tjv-smash' : undefined} style={{ transformOrigin: '100px 110px' }}>
      <rect x="50" y="74" width="100" height="60" rx="20" fill="#4caf50" stroke="#2f7d36" strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={57 + i * 24}
          y="68"
          width="20"
          height="36"
          rx="10"
          fill="#5cc463"
          stroke="#2f7d36"
          strokeWidth="2.5"
        />
      ))}
      <rect x="45" y="104" width="35" height="20" rx="10" fill="#5cc463" stroke="#2f7d36" strokeWidth="2.5" />
      <rect x="64" y="134" width="72" height="21" rx="10" fill="#2f7d36" />
    </g>
  )
}

/** Reator com propulsores: as chamas laterais acendem em ritmo próprio. */
function Reactor({ alive }: { alive?: boolean }) {
  const thruster = (x: number, flip: number) => (
    <g transform={`translate(${x} 150) scale(${flip} 1)`}>
      <rect x="-11" y="-16" width="22" height="20" rx="6" fill="#b8c6de" stroke="#7d92b3" strokeWidth="2" />
      <path
        d="M-9 4 Q0 34 9 4 Z"
        fill="#9fe8ff"
        className={alive ? 'tjv-thrust' : undefined}
        style={{ transformOrigin: '0px 4px' }}
      />
      <path
        d="M-5 4 Q0 22 5 4 Z"
        fill="#ffffff"
        className={alive ? 'tjv-thrust' : undefined}
        style={{ transformOrigin: '0px 4px', animationDelay: '160ms' }}
      />
    </g>
  )

  return (
    <>
      <circle cx="100" cy="96" r="60" fill="none" stroke="#c8102e" strokeWidth="7" />

      {/* bobinas girando em volta do núcleo */}
      <g className={alive ? 'tjv-orbit' : undefined} style={{ transformOrigin: '100px 96px' }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI / 4) * i
          return (
            <circle
              key={i}
              cx={100 + 40 * Math.cos(a)}
              cy={96 + 40 * Math.sin(a)}
              r="7.5"
              fill="#f0a92c"
              opacity="0.85"
            />
          )
        })}
      </g>

      {/* núcleo pulsando */}
      <g className={alive ? 'tjv-glow' : undefined} style={{ transformOrigin: '100px 96px' }}>
        <circle cx="100" cy="96" r="29" fill="#9fe8ff" />
        <circle cx="100" cy="96" r="19" fill="#f2fdff" />
        <polygon points={starPoints(100, 96, 14)} fill="#8fd0ff" opacity="0.75" />
      </g>

      {thruster(62, 1)}
      {thruster(138, -1)}
    </>
  )
}

function Web({ alive }: { alive?: boolean }) {
  const spokes = 8
  return (
    <g {...breathe(alive)}>
      {Array.from({ length: spokes }, (_, i) => {
        const a = ((Math.PI * 2) / spokes) * i - Math.PI / 2
        return (
          <line
            key={i}
            x1="100"
            y1="100"
            x2={100 + 68 * Math.cos(a)}
            y2={100 + 68 * Math.sin(a)}
            stroke="#f2f5fb"
            strokeWidth="3"
            strokeOpacity="0.85"
          />
        )
      })}
      {[26, 44, 62].map((r) => (
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
  )
}

/** Portal místico — anéis de faísca girando em sentidos opostos. */
function Portal({ alive }: { alive?: boolean }) {
  const ring = (r: number, dash: string, color: string, reverse?: boolean) => (
    <circle
      cx="100"
      cy="100"
      r={r}
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeDasharray={dash}
      strokeLinecap="round"
      className={alive ? (reverse ? 'tjv-orbit-rev' : 'tjv-orbit') : undefined}
      style={{ transformOrigin: '100px 100px' }}
    />
  )
  return (
    <>
      <circle cx="100" cy="100" r="46" fill="#2b1533" />
      {ring(70, '18 14', '#ff9a3c')}
      {ring(58, '10 12', '#ffc46b', true)}
      {ring(46, '22 10', '#ff7a1c')}
      <circle cx="100" cy="100" r="20" fill="#ffd9a0" className={alive ? 'tjv-glow' : undefined} style={{ transformOrigin: '100px 100px' }} />
    </>
  )
}

/** Alvo com flecha — mira no objetivo. */
function Arrow({ alive }: { alive?: boolean }) {
  return (
    <>
      <g className={alive ? 'tjv-ping' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <circle cx="100" cy="100" r="66" fill="none" stroke="#8f2f2f" strokeWidth="6" />
        <circle cx="100" cy="100" r="46" fill="none" stroke="#c85050" strokeWidth="6" />
        <circle cx="100" cy="100" r="26" fill="none" stroke="#eb8a8a" strokeWidth="6" />
      </g>
      <g {...breathe(alive)}>
        <line x1="38" y1="162" x2="112" y2="88" stroke="#d8e2f2" strokeWidth="7" strokeLinecap="round" />
        <polygon points="122,78 100,86 114,100" fill="#e34a4a" />
        <path d="M38 162 L34 146 L50 150 Z" fill="#d8e2f2" />
      </g>
      <circle cx="100" cy="100" r="8" fill="#e34a4a" />
    </>
  )
}

/** Garras de vibranium — construção e força. */
function Claws({ alive }: { alive?: boolean }) {
  return (
    <g {...breathe(alive)}>
      <circle cx="100" cy="100" r="66" fill="#1d1430" />
      {[-1, 0, 1].map((d, i) => (
        <path
          key={i}
          d={`M${100 + d * 30} 148 Q${100 + d * 34} 96 ${100 + d * 20} 54`}
          stroke="#c9b8f0"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <circle cx="100" cy="152" r="16" fill="#7a5cc4" />
    </g>
  )
}

/** Gema da mente — conhecimento. */
function Gem({ alive }: { alive?: boolean }) {
  return (
    <g className={alive ? 'tjv-glow' : undefined} style={{ transformOrigin: '100px 100px' }}>
      <circle cx="100" cy="100" r="64" fill="#0f2a2e" />
      <polygon points="100,38 148,84 128,158 72,158 52,84" fill="#f5c33b" stroke="#c99a1e" strokeWidth="3" />
      <polygon points="100,38 128,158 100,110" fill="#ffe38a" opacity="0.55" />
      <polygon points="100,38 72,158 100,110" fill="#d9a521" opacity="0.5" />
    </g>
  )
}

/** Hexágono místico — energia contida. */
function Hex({ alive }: { alive?: boolean }) {
  const hexPoints = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2
      return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
    }).join(' ')

  return (
    <>
      <circle cx="100" cy="100" r="66" fill="#2e1018" />
      <g className={alive ? 'tjv-orbit' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <polygon points={hexPoints(64)} fill="none" stroke="#e0263c" strokeWidth="4" strokeOpacity="0.6" />
      </g>
      <g {...breathe(alive)}>
        <polygon points={hexPoints(48)} fill="none" stroke="#ff6b7d" strokeWidth="5" />
        <polygon points={hexPoints(30)} fill="#e0263c" opacity="0.85" />
      </g>
    </>
  )
}

/** Núcleo de IA — ondas de voz do assistente. */
function Core({ alive }: { alive?: boolean }) {
  const bars = [
    { x: 58, h: 32 },
    { x: 76, h: 58 },
    { x: 94, h: 80 },
    { x: 112, h: 58 },
    { x: 130, h: 32 },
  ]
  return (
    <>
      <circle cx="100" cy="100" r="66" fill="#0a2233" />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="#3fc9ff"
        strokeWidth="3"
        strokeDasharray="20 12"
        className={alive ? 'tjv-orbit' : undefined}
        style={{ transformOrigin: '100px 100px' }}
      />
      <g className={alive ? 'tjv-wave' : undefined}>
        {bars.map((b, i) => (
          <rect
            key={b.x}
            x={b.x}
            y={100 - b.h / 2}
            width="12"
            height={b.h}
            rx="6"
            fill="#3fc9ff"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </g>
    </>
  )
}

/** Águia do comando — controle do sistema. */
function Eagle({ alive }: { alive?: boolean }) {
  return (
    <g {...breathe(alive)}>
      <circle cx="100" cy="100" r="66" fill="#141c2e" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="#7f93bb" strokeWidth="4" />
      {/* asas abertas */}
      <path d="M34 96 Q68 74 96 100 Q68 112 34 108 Z" fill="#a8bbdd" />
      <path d="M166 96 Q132 74 104 100 Q132 112 166 108 Z" fill="#a8bbdd" />
      {/* corpo */}
      <path d="M100 66 L112 100 L100 148 L88 100 Z" fill="#d8e2f2" />
      <circle cx="100" cy="86" r="10" fill="#e0263c" />
    </g>
  )
}

const EMBLEMS: Record<EmblemId, (p: { alive?: boolean }) => React.ReactElement> = {
  shield: Shield,
  hammer: Hammer,
  fist: Fist,
  reactor: Reactor,
  web: Web,
  portal: Portal,
  arrow: Arrow,
  claws: Claws,
  gem: Gem,
  hex: Hex,
  core: Core,
  eagle: Eagle,
}

export default function HeroEmblem({ emblem, size = 64, alive = false, className }: Props) {
  const Emblem = EMBLEMS[emblem] ?? Shield

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <Emblem alive={alive} />
    </svg>
  )
}
