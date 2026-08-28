import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { signOut } = useAuth()

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Configurações</h1>

      <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-medium">Sessão</p>
            <p className="text-text-dim text-sm">Sair da sua conta neste dispositivo</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm font-medium text-danger hover:opacity-80 transition-opacity"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      <p className="text-text-dim text-xs mt-4">
        Mais preferências (tema, senha, notificações) chegam conforme o sistema evolui.
      </p>
    </div>
  )
}
