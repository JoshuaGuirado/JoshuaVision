import HeroEmblem from './HeroEmblem'
import { findModel } from '../lib/models'

/**
 * Avatar do herói ativo no assistente.
 *
 * É o emblema do modelo dentro de uma moldura circular, para funcionar bem como
 * bolha flutuante. O desenho em si vive em `HeroEmblem` — aqui só entra a
 * moldura, evitando manter dois conjuntos de arte.
 */
export default function HeroAvatar({
  modelId,
  size = 64,
  alive = false,
  className,
}: {
  modelId: string
  size?: number
  alive?: boolean
  className?: string
}) {
  const model = findModel(modelId)
  const color = model?.color ?? '#e0263c'

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#0b1428',
        boxShadow: `inset 0 0 0 2px ${color}80`,
      }}
    >
      <HeroEmblem emblem={model?.emblem ?? 'shield'} size={size * 0.84} alive={alive} />
    </span>
  )
}
