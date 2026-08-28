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

type FxPrefs = {
  sound: boolean
  voice: boolean
  motion: boolean
  /** Voz escolhida nas Configurações; vazio = a que o aparelho oferecer. */
  vozMasculina?: string
  vozFeminina?: string
}

/** Como um herói soa: tom e velocidade em cima da voz do aparelho. */
export type PerfilVoz = { genero: 'm' | 'f'; pitch: number; rate: number }

/**
 * VOZES GRAVADAS — as mesmas em qualquer aparelho.
 *
 * A voz do navegador muda de aparelho para aparelho (o iPhone do Joshua só
 * oferece voz feminina; o computador dele tem duas). Estes arquivos foram
 * gerados uma vez por `scripts/gerar-vozes.mjs` e ficam no site, então o Thor
 * soa exatamente igual no celular e no computador.
 *
 * O mapa liga o texto da fala ao arquivo. Falas que ainda não foram gravadas —
 * e as que mudam com os dados do Joshua ("3 tarefas na fila") — caem na voz do
 * aparelho, que continua de reserva.
 */
let gravadas: Record<string, string> = {}
void import('./vozes.json').then((m) => {
  gravadas = (m.default ?? m) as Record<string, string>
})

/** Toca o arquivo gravado desta fala. Devolve `false` se não existir um. */
function tocarGravada(texto: string, aoTerminar?: () => void): boolean {
  const arquivo = gravadas[texto]
  if (!arquivo) return false

  const audio = new Audio(arquivo)
  audio.addEventListener('ended', () => aoTerminar?.())
  // O navegador pode recusar tocar sem um toque recente. Nesse caso não
  // adianta insistir: é melhor ficar em silêncio do que estourar um erro.
  void audio.play().catch(() => {})
  vozAtual = audio
  return true
}

/** A fala gravada que está tocando agora, para conseguir interrompê-la. */
let vozAtual: HTMLAudioElement | null = null

/**
 * ARRUMA O TEXTO ANTES DE FALAR.
 *
 * O que está escrito na tela nem sempre é o que soa bem. A voz do aparelho
 * lia "F.R.I.D.A.Y." letra por letra ("efe, erre, i, dê...") e "R$ 100" como
 * "erre cifrão cem". Aqui o texto vira a versão falada, sem mudar o que o
 * Joshua lê.
 */
function paraFala(texto: string): string {
  return (
    texto
      .replace(/F\.?R\.?I\.?D\.?A\.?Y\.?/gi, 'Fraidei')
      // "R$ 1.234,50" -> "1.234,50 reais"
      .replace(/R\$\s*(-?[\d.,]+)/g, '$1 reais')
      .replace(/(\d)\s*%/g, '$1 por cento')
      .replace(/\bIA\b/g, 'inteligência artificial')
      // travessão vira pausa: senão a voz emenda as duas frases
      .replace(/\s*[—–]\s*/g, ', ')
  )
}

/** Vozes em português disponíveis neste aparelho. */
export function vozesDisponiveis(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  const todas = window.speechSynthesis.getVoices()
  const pt = todas.filter((v) => v.lang.toLowerCase().startsWith('pt'))
  // Sem nenhuma em português, é melhor oferecer as outras do que nada.
  return pt.length ? pt : todas
}

type FxValue = {
  prefs: FxPrefs
  setPref: <K extends keyof FxPrefs>(key: K, value: FxPrefs[K]) => void
  /** Estoura a palavra na tela (e toca o som, se ligado). */
  bang: (word: string, color: string, kind?: BangKind) => void
  /** Lê um texto na voz do navegador, se o Joshua tiver ligado. */
  speak: (text: string, perfil?: PerfilVoz, forcar?: boolean) => void
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

/**
 * O NAVEGADOR SÓ DEIXA TOCAR SOM DEPOIS DE UM CLIQUE.
 *
 * Esta era a causa de nenhum barulho sair: cada ação criava um `AudioContext`
 * novo, e um contexto criado DEPOIS de uma espera (a gravação no banco, por
 * exemplo) já não conta mais como "resposta a um clique" — ele nasce suspenso
 * e fica mudo, sem erro nenhum no console.
 *
 * A correção é ter UM contexto só, criado no primeiro toque do Joshua na
 * página e mantido acordado a partir dali.
 */
let audioCtx: AudioContext | null = null

function pegarContexto(): AudioContext | null {
  const Ctx =
    window.AudioContext ??
    (window as never as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  // o navegador suspende o contexto sozinho; acordar é barato e seguro
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

/** Prepara o áudio no primeiro toque na página, enquanto ainda vale o gesto. */
function liberarAudioNoPrimeiroToque() {
  const liberar = () => {
    pegarContexto()
    window.removeEventListener('pointerdown', liberar)
    window.removeEventListener('keydown', liberar)
  }
  window.addEventListener('pointerdown', liberar)
  window.addEventListener('keydown', liberar)
  return () => {
    window.removeEventListener('pointerdown', liberar)
    window.removeEventListener('keydown', liberar)
  }
}

/** Sons curtos gerados na hora — sem arquivo, sem download, sem atraso. */
function tocar(kind: BangKind) {
  const ctx = pegarContexto()
  if (!ctx) return
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

  // O contexto NÃO é fechado: ele é um só para o site inteiro e precisa
  // continuar vivo, senão o próximo som volta a nascer mudo.
}

export function FxProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<FxPrefs>(lerPrefs)
  const [bursts, setBursts] = useState<Burst[]>([])
  const proximoId = useRef(0)

  const setPref = useCallback(<K extends keyof FxPrefs>(key: K, value: FxPrefs[K]) => {
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
    if (vozAtual) {
      vozAtual.pause()
      vozAtual = null
    }
  }, [])

  const speak = useCallback(
    (text: string, perfil?: PerfilVoz, forcar = false) => {
      // `forcar` existe para a amostra em Configurações: quando o Joshua acaba
      // de ligar a voz, a preferência ainda não chegou aqui.
      if (!prefs.voice && !forcar) return

      // Interrompe o que estiver falando: duas vozes juntas nao se entende.
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      if (vozAtual) {
        vozAtual.pause()
        vozAtual = null
      }

      // Primeiro a voz gravada do heroi — e a mesma em qualquer aparelho.
      if (tocarGravada(text)) return
      if (!('speechSynthesis' in window)) return

      const fala = new SpeechSynthesisUtterance(paraFala(text))
      fala.lang = 'pt-BR'
      // O tom e a velocidade são o que diferencia um herói do outro: o
      // aparelho costuma ter só duas vozes em português.
      fala.pitch = perfil?.pitch ?? 0.95
      fala.rate = perfil?.rate ?? 1.0

      const disponiveis = vozesDisponiveis()
      const escolhida = perfil?.genero === 'f' ? prefs.vozFeminina : prefs.vozMasculina
      const voz =
        disponiveis.find((v) => v.name === escolhida) ??
        // sem escolha salva, tenta adivinhar pelo nome que o sistema usa
        disponiveis.find((v) =>
          perfil?.genero === 'f'
            ? /maria|luciana|f[eê]mea|female|joana|ana/i.test(v.name)
            : /daniel|male|ricardo|jo[aã]o|felipe/i.test(v.name),
        ) ??
        disponiveis[0]
      if (voz) fala.voice = voz

      window.speechSynthesis.speak(fala)
    },
    [prefs.voice, prefs.vozMasculina, prefs.vozFeminina],
  )

  // Se o Joshua sair da página no meio de uma fala, ela não continua sozinha.
  useEffect(() => () => hush(), [hush])

  // Deixa o áudio pronto no primeiro clique/toque, enquanto o navegador ainda
  // aceita — depois disso ele bloqueia som que não veio de um gesto.
  useEffect(() => liberarAudioNoPrimeiroToque(), [])

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
