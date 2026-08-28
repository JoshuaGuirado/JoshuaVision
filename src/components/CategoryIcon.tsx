import * as Icons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

export const CATEGORY_ICON_NAMES = [
  'circle',
  'utensils',
  'car',
  'home',
  'shopping-bag',
  'heart-pulse',
  'graduation-cap',
  'plane',
  'gamepad-2',
  'wallet',
  'briefcase',
  'gift',
  'dog',
  'popcorn',
  'dumbbell',
] as const

function toPascalCase(name: string) {
  return name
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('')
}

export default function CategoryIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[
    toPascalCase(name)
  ] ?? Icons.Circle
  return <Icon {...props} />
}
