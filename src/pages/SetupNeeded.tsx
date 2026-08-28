import { AlertTriangle } from 'lucide-react'

export default function SetupNeeded() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md">
        <p className="text-center text-sm font-extrabold tracking-[0.3em] mb-8">
          THE JOSHUA
          <br />
          <span className="text-accent">VISION</span>
        </p>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-accent mb-3">
            <AlertTriangle size={18} />
            <p className="font-semibold">Configuração pendente</p>
          </div>

          <p className="text-text-dim text-sm mb-4">
            As chaves do Supabase não foram encontradas. Defina as variáveis abaixo no ambiente
            (local em <code className="text-text">.env.local</code>, ou nas Environment Variables
            do provedor de deploy) e publique novamente.
          </p>

          <ul className="space-y-1.5 text-sm">
            <li className="bg-surface-2 rounded-lg px-3 py-2 font-mono text-xs">
              VITE_SUPABASE_URL
            </li>
            <li className="bg-surface-2 rounded-lg px-3 py-2 font-mono text-xs">
              VITE_SUPABASE_ANON_KEY
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
