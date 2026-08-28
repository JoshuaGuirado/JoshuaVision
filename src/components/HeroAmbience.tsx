import { useMemo } from 'react'

/**
 * O FUNDO VIVO DE CADA MÓDULO.
 *
 * Partículas na cor do herói subindo devagar atrás de tudo. Cada módulo ganha
 * um "clima" diferente pelo formato e pelo ritmo: faíscas do portal do Doutor
 * Estranho, brasas do Hulk, poeira estelar dos Guardiões.
 *
 * É tudo CSS: nada de canvas, nada de biblioteca — o celular aguenta sem
 * esquentar.
 */
export type Ambience = 'faisca' | 'brasa' | 'estrela' | 'raio' | 'circuito'

/** Cada herói tem o seu clima. Os que não estão aqui usam faíscas. */
export const AMBIENCE_BY_PATH: Record<string, Ambience> = {
  '/hoje': 'estrela',
  '/agenda': 'faisca',
  '/financas': 'estrela',
  '/tarefas': 'circuito',
  '/metas': 'faisca',
  '/habitos': 'raio',
  '/projetos': 'brasa',
  '/estudos': 'brasa',
  '/saude': 'estrela',
  '/notas': 'faisca',
  '/assistente': 'circuito',
  '/configuracoes': 'brasa',
}

export default function HeroAmbience({
  color,
  kind = 'faisca',
  count = 22,
}: {
  color: string
  kind?: Ambience
  count?: number
}) {
  // Posições sorteadas uma vez: se recalculassem a cada render, as partículas
  // "pulariam" pela tela toda hora.
  const particulas = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        esquerda: Math.random() * 100,
        atraso: Math.random() * 14,
        duracao: 11 + Math.random() * 14,
        tamanho: kind === 'raio' ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 4,
        opacidade: 0.25 + Math.random() * 0.5,
      })),
    [count, kind],
  )

  const formato =
    kind === 'raio'
      ? { borderRadius: '1px', height: '14px' }
      : kind === 'circuito'
        ? { borderRadius: '1px' }
        : { borderRadius: '50%' }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particulas.map((p) => (
        <span
          key={p.id}
          className="tjv-float absolute bottom-[-10vh]"
          style={{
            left: `${p.esquerda}%`,
            width: p.tamanho,
            height: formato.height ?? p.tamanho,
            borderRadius: formato.borderRadius,
            background: color,
            opacity: p.opacidade,
            boxShadow: `0 0 ${p.tamanho * 3}px ${color}`,
            animationDelay: `${p.atraso}s`,
            animationDuration: `${p.duracao}s`,
          }}
        />
      ))}
    </div>
  )
}
