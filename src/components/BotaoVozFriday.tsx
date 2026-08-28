import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useFx } from '../lib/fx'
import { HERO_VOICES } from '../lib/heroVoice'

/**
 * VOZ DA F.R.I.D.A.Y.
 *
 * Ligado, ela lê em voz alta cada resposta do assistente — com a voz dela,
 * feminina, e não com a do herói da tela onde o Joshua estiver.
 *
 * A escolha fica só nesta tela e é lembrada entre sessões: é uma preferência
 * do assistente, separada da voz dos heróis nos módulos.
 */

const CHAVE = 'tjv:friday-fala'
const PERFIL = HERO_VOICES['/assistente'].voz

function lerPreferencia() {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

export function useVozDaFriday(ultimaResposta: string, respondendo: boolean) {
  const [ligada, setLigada] = useState(lerPreferencia)
  const { speak, hush } = useFx()
  // Guarda o que já foi lido para não repetir a cada pedaço que chega no
  // streaming da resposta.
  const jaFalado = useRef('')

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, ligada ? '1' : '0')
    } catch {
      /* navegação privada */
    }
    if (!ligada) hush()
  }, [ligada, hush])

  // Fala só quando a resposta termina: durante o streaming o texto muda a cada
  // instante, e ler no meio sairia picotado.
  useEffect(() => {
    if (!ligada || respondendo) return
    const texto = ultimaResposta.trim()
    if (!texto || texto === jaFalado.current) return

    jaFalado.current = texto
    // `forcar` ignora a preferência global de voz: aqui quem manda é este botão.
    speak(limparParaFala(texto), PERFIL, true)
  }, [ultimaResposta, respondendo, ligada, speak])

  return { ligada, alternar: () => setLigada((v) => !v) }
}

/** Tira a marcação que ficaria estranha se lida em voz alta. */
function limparParaFala(texto: string) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+?)`/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/R\$\s?/g, 'reais ')
}

export default function BotaoVozFriday({
  ligada,
  alternar,
}: {
  ligada: boolean
  alternar: () => void
}) {
  return (
    <button
      onClick={alternar}
      className={`transition-colors p-1.5 -m-0.5 ${
        ligada ? 'text-accent' : 'text-text-faint hover:text-text'
      }`}
      aria-label={ligada ? 'Parar de ouvir a F.R.I.D.A.Y.' : 'Ouvir a F.R.I.D.A.Y.'}
      title={ligada ? 'F.R.I.D.A.Y. lendo as respostas' : 'Deixar a F.R.I.D.A.Y. ler as respostas'}
    >
      {ligada ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  )
}
