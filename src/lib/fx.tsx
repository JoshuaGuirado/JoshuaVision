import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * EFEITOS DO SITE — o que acontece quando o Joshua faz alguma coisa.
 *
 * Junta três coisas num lugar só:
 *  - o estouro de quadrinho ("SMASH!") no meio da tela;
 *  - o som curto da ação, gerado na hora pelo navegador (não baixa arquivo);
 *  - a voz do herói lendo a fala, quando o Joshua liga.
 *
 * Som e voz vêm DESLIGADOS: barulho sem pedir é a forma mais rápida de um
 * site cansar. Os interruptores ficam em Configurações e são lembrados no
 * aparelho.
 */

export type BangKind = 'impact' | 'shield' | 'thunder' | 'web' | 'tech'

type Burst = { id: number; word: string; color: string }

type FxPrefs = { sound: boolean; voice: boolean; motion: boolean }

type FxValue = {
  prefs: FxPrefs
  setPref: (key: keyof FxPrefs, value: boolean) => void
  /** Estoura a palavra na tela (e toca o som, se ligado). */
  bang: (word: string, color: string, kind?: BangKind) => void
  /** Lê um texto na voz do navegador, se o Joshua tiver ligado. */
  speak: (text: string, forcar?: boolean) => void
  /** Toca um som de amostra ignorando a preferência — usado ao ligar o som. */
  preview: (kind: BangKind) => void
  /** Cala a boca agora (troca de tela, por exemplo). */
  hush: () => void
  /** Sobe quando algo é criado fora da tela atual; as listas recarregam. */
  versaoDados: number
  /** Avisa as listas abertas de que os dados mudaram. */
  avisarMudanca: () => void
}

const CHAVE = 'tjv:fx'
const PADRAO: FxPrefs = { sound: false, voice: false, motion: true }

const FxContext = createContext<FxValue | undefined>(undefined)

function lerPrefs(): FxPrefs {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? { ...PADRAO, ...JSON.parse(bruto) } : PADRAO
  } catch {
    // aba anônima, armazenamento bloqueado: segue com o padrão
    return PADRAO
  }
}

/** Sons curtos gerados na hora — sem arquivo, sem download, sem atraso. */
function tocar(kind: BangKind) {
  const Ctx = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return
  const ctx = new Ctx()
  const agora = ctx.currentTime
  const saida = ctx.createGain()
  saida.gain.value = 0.28
  saida.connect(ctx.destination)

  const ruido = (dur: number, vol: number, filtro: number) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const dados = buf.getChannelData(0)
    for (let i = 0; i < dados.length; i++) {
      dados[i] = (Math.random() * 2 - 1) * (1 - i / dados.length) ** 2
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = filtro
    const g = ctx.createGain()
    g.gain.value = vol
    src.connect(bp).connect(g).connect(saida)
    src.start(agora)
  }

  const tom = (freq: number, dur: number, tipo: OscillatorType, vol = 0.5, desce = 0) => {
    const osc = ctx.createOscillator()
    osc.type = tipo
    osc.frequency.setValueAtTime(freq, agora)
    if (desce) osc.frequency.exponentialRampToValueAtTime(desce, agora + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, agora)
    g.gain.exponentialRampToValueAtTime(0.001, agora + dur)
    osc.connect(g).connect(saida)
    osc.start(agora)
    osc.stop(agora + dur)
  }

  switch (kind) {
    case 'shield': // metal batendo e vibrando
      tom(880, 0.5, 'triangle', 0.35, 320)
      tom(1320, 0.42, 'sine', 0.18)
      ruido(0.12, 0.25, 2600)
      break
    case 'thunder': // estouro grave rolando
      tom(70, 0.7, 'sawtooth', 0.4, 32)
      ruido(0.55, 0.4, 420)
      break
    case 'web': // o "thwip" agudo e rápido
      tom(1600, 0.14, 'square', 0.16, 480)
      ruido(0.14, 0.22, 4200)
      break
    case 'tech': // bipe curto de HUD
      tom(660, 0.09, 'square', 0.16)
      tom(990, 0.12, 'square', 0.12)
      break
    default: // impacto seco
      tom(140, 0.34, 'square', 0.32, 48)
      ruido(0.26, 0.4, 900)
  }

  // fecha o contexto sozinho: cada ação abre um, e o navegador limita quantos
  // ficam vivos ao mesmo tempo.
  window.setTimeout(() => void ctx.close(), 1200)
}

export function FxProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<FxPrefs>(lerPrefs)
  const [bursts, setBursts] = useState<Burst[]>([])
  const proximoId = useRef(0)

  const setPref = useCallback((key: keyof FxPrefs, value: boolean) => {
    setPrefs((p) => {
      const novo = { ...p, [key]: value }
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo))
      } catch {
        // sem armazenamento: vale só nesta sessão
      }
      return novo
    })
  }, [])

  const bang = useCallback(
    (word: string, color: string, kind: BangKind = 'impact') => {
      if (prefs.sound) tocar(kind)
      if (!prefs.motion) return
      const id = proximoId.current++
      setBursts((b) => [...b, { id, word, color }])
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900)
    },
    [prefs.sound, prefs.motion],
  )

  const hush = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const speak = useCallback(
    (text: string, forcar = false) => {
      // `forcar` existe para a amostra em Configurações: quando o Joshua acaba
      // de ligar a voz, a preferência ainda não chegou aqui.
      if ((!prefs.voice && !forcar) || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const fala = new SpeechSynthesisUtterance(text)
      fala.lang = 'pt-BR'
      fala.rate = 1.02
      fala.pitch = 0.92
      window.speechSynthesis.speak(fala)
    },
    [prefs.voice],
  )

  // Se o Joshua sair da página no meio de uma fala, ela não continua sozinha.
  useEffect(() => () => hush(), [hush])

  const preview = useCallback((kind: BangKind) => tocar(kind), [])

  // O "adicionar rápido" grava direto no banco, de qualquer tela. Sem este
  // aviso, criar uma tarefa estando na tela de Tarefas não mostrava nada até
  // recarregar a página.
  const [versaoDados, setVersaoDados] = useState(0)
  const avisarMudanca = useCallback(() => setVersaoDados((v) => v + 1), [])

  const valor = useMemo(
    () => ({ prefs, setPref, bang, speak, hush, preview, versaoDados, avisarMudanca }),
    [prefs, setPref, bang, speak, hush, preview, versaoDados, avisarMudanca],
  )

  return (
    <FxContext.Provider value={valor}>
      {children}

      {/* ---- estouros de quadrinho ---- */}
      <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
        {bursts.map((b) => (
          <div key={b.id} className="tjv-bang absolute">
            <svg viewBox="0 0 300 200" className="w-[62vw] max-w-[26rem]">
              {/* raios saindo do centro */}
              <g className="tjv-rays" style={{ transformOrigin: '150px 100px' }}>
                {Array.from({ length: 16 }, (_, i) => {
                  const a = (Math.PI / 8) * i
                  return (
                    <line
                      key={i}
                      x1={150 + Math.cos(a) * 52}
                      y1={100 + Math.sin(a) * 38}
                      x2={150 + Math.cos(a) * 148}
                      y2={100 + Math.sin(a) * 104}
                      stroke={b.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  )
                })}
              </g>
              {/* estrela do impacto */}
              <polygon
                points={Array.from({ length: 20 }, (_, i) => {
                  const a = (Math.PI / 10) * i - Math.PI / 2
                  const r = i % 2 === 0 ? 1 : 0.62
                  return `${150 + Math.cos(a) * 118 * r},${100 + Math.sin(a) * 82 * r}`
                }).join(' ')}
                fill={b.color}
                stroke="#08090c"
                strokeWidth="6"
              />
              <text
                x="150"
                y="100"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                stroke="#08090c"
                strokeWidth="5"
                paintOrder="stroke"
                style={{
                  fontSize: b.word.length > 7 ? 34 : 46,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                }}
              >
                {b.word}
              </text>
            </svg>
          </div>
        ))}
      </div>
    </FxContext.Provider>
  )
}

export function useFx(): FxValue {
  const ctx = useContext(FxContext)
  if (!ctx) throw new Error('useFx precisa estar dentro de <FxProvider>')
  return ctx
}
