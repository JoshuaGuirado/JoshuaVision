import type { LucideIcon } from 'lucide-react'

export default function ComingSoon({
  label,
  description,
  icon: Icon,
}: {
  label: string
  description: string
  icon: LucideIcon
}) {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{label}</h1>
      <div className="border border-dashed border-border rounded-2xl p-10 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-accent">
          <Icon size={22} />
        </div>
        <p className="font-medium">Em desenvolvimento</p>
        <p className="text-text-dim text-sm max-w-xs">{description}</p>
      </div>
    </div>
  )
}
