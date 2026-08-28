import { useEffect, useRef, useState } from 'react'

/**
 * PROFUNDIDADE FALSA, MAS CONVINCENTE.
 *
 * Não dá para colocar um modelo 3D de verdade aqui, então o truque é este:
 * saber para onde o Joshua está olhando (mouse no computador, inclinação do
 * aparelho no celular) e mover cada camada numa velocidade diferente. O fundo
 * anda pouco, o herói anda mais — o olho lê isso como profundidade.
 *
 * Devolve dois números de -1 a 1: o quanto o ponteiro está para os lados e
 * para cima/baixo, em relação ao centro da tela.
 */
export function usePointer() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  // O alvo é atualizado a cada movimento, mas a tela só é redesenhada no
  // ritmo do navegador: sem isso, mexer o mouse dispara centenas de renders.
  const alvo = useRef({ x: 0, y: 0 })
  const quadro = useRef<number | undefined>(undefined)

  useEffect(() => {
    const suave = () => {
      setPos((atual) => {
        const dx = alvo.current.x - atual.x
        const dy = alvo.current.y - atual.y
        // parou de valer a pena animar: encosta e para
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return atual
        return { x: atual.x + dx * 0.12, y: atual.y + dy * 0.12 }
      })
      quadro.current = requestAnimationFrame(suave)
    }
    quadro.current = requestAnimationFrame(suave)

    const noMouse = (e: MouseEvent) => {
      alvo.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }

    const noGiro = (e: DeviceOrientationEvent) => {
      // gamma: inclinação lateral; beta: para frente/trás. Limitados para o
      // efeito não sair correndo quando o celular vira.
      const g = Math.max(-30, Math.min(30, e.gamma ?? 0))
      const b = Math.max(-30, Math.min(30, (e.beta ?? 0) - 45))
      alvo.current = { x: g / 30, y: b / 30 }
    }

    window.addEventListener('mousemove', noMouse)
    window.addEventListener('deviceorientation', noGiro)
    return () => {
      window.removeEventListener('mousemove', noMouse)
      window.removeEventListener('deviceorientation', noGiro)
      if (quadro.current) cancelAnimationFrame(quadro.current)
    }
  }, [])

  return pos
}

/**
 * Inclinação 3D de um cartão sob o mouse, com brilho seguindo o cursor.
 * Devolve o que prender no elemento e os valores para o brilho.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(forca = 9) {
  const ref = useRef<T>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, ativo: false })

  const props = {
    ref,
    onMouseMove: (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      setTilt({
        rx: (0.5 - py) * forca,
        ry: (px - 0.5) * forca,
        mx: px * 100,
        my: py * 100,
        ativo: true,
      })
    },
    onMouseLeave: () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, ativo: false }),
  }

  return { props, tilt }
}
