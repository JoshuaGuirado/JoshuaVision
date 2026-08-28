import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ESCUTA POR VOZ.
 *
 * Usa o reconhecimento de fala do próprio navegador (Web Speech API). Duas
 * limitações que valem estar escritas, porque não são contornáveis por código:
 *
 * 1. Só funciona com a tela do app aberta. Quando o Joshua troca de aba ou
 *    bloqueia o celular, o sistema suspende a página e o microfone é cortado.
 *    Escutar em segundo plano exigiria um app nativo.
 * 2. O Safari do iPhone corta a escuta a cada frase e às vezes pede permissão
 *    de novo. Por isso o modo contínuo se re-arma sozinho quando termina.
 */

// A API vive com prefixo em quase todo lugar; o tipo mínimo evita `any` solto.
type Reconhecimento = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionLikeEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionLikeEvent = {
  resultIndex: number
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >
}

function construtor(): (new () => Reconhecimento) | null {
  const janela = window as unknown as Record<string, unknown>
  return (janela.SpeechRecognition ?? janela.webkitSpeechRecognition) as
    | (new () => Reconhecimento)
    | null
}

export const escutaDisponivel = () => construtor() !== null

export type EstadoEscuta = 'parada' | 'ouvindo' | 'sem-permissao' | 'indisponivel'

/**
 * @param aoOuvir chamado com a frase final reconhecida
 * @param continua re-arma sozinha depois de cada frase, para o Joshua poder
 *   falar várias vezes sem tocar em nada
 */
export function useEscuta(aoOuvir: (frase: string) => void, continua = true) {
  const [estado, setEstado] = useState<EstadoEscuta>(() =>
    escutaDisponivel() ? 'parada' : 'indisponivel',
  )
  const [parcial, setParcial] = useState('')

  const reconhecimento = useRef<Reconhecimento | null>(null)
  // Guardado em ref para o `onend` sempre enxergar o valor atual, e não o do
  // render em que foi criado.
  const queremosOuvir = useRef(false)
  const callback = useRef(aoOuvir)
  callback.current = aoOuvir

  const parar = useCallback(() => {
    queremosOuvir.current = false
    reconhecimento.current?.stop()
    setEstado('parada')
    setParcial('')
  }, [])

  const comecar = useCallback(() => {
    const Construtor = construtor()
    if (!Construtor) {
      setEstado('indisponivel')
      return
    }

    // Uma instância por sessão de escuta: reaproveitar depois de erro deixa a
    // API num estado inconsistente em alguns navegadores.
    const r = new Construtor()
    r.lang = 'pt-BR'
    r.continuous = false
    r.interimResults = true

    r.onresult = (e) => {
      let finais = ''
      let provisorio = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const alternativa = e.results[i][0]
        if (e.results[i].isFinal) finais += alternativa.transcript
        else provisorio += alternativa.transcript
      }
      setParcial(provisorio)
      const frase = finais.trim()
      if (frase) {
        setParcial('')
        callback.current(frase)
      }
    }

    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        queremosOuvir.current = false
        setEstado('sem-permissao')
      }
      // 'no-speech' e 'aborted' são normais: o onend re-arma.
    }

    r.onend = () => {
      if (queremosOuvir.current && continua) {
        // Um respiro evita laço apertado quando o navegador encerra na hora.
        setTimeout(() => {
          try {
            r.start()
          } catch {
            /* já iniciado */
          }
        }, 250)
      } else if (!queremosOuvir.current) {
        setEstado('parada')
      }
    }

    reconhecimento.current = r
    queremosOuvir.current = true

    try {
      r.start()
      setEstado('ouvindo')
    } catch {
      setEstado('parada')
    }
  }, [continua])

  // Ao sair da tela, solta o microfone: deixar aberto acende a luz da câmera/mic
  // e gasta bateria à toa.
  useEffect(() => {
    return () => {
      queremosOuvir.current = false
      reconhecimento.current?.abort()
    }
  }, [])

  return { estado, parcial, comecar, parar, alternar: () => (estado === 'ouvindo' ? parar() : comecar()) }
}
