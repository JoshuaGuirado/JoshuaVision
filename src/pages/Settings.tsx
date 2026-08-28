import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, Card } from '../components/ui'
import { APP_EMAIL } from '../lib/supabase'

export default function Settings() {
  const { signOut } = useAuth()

  return (
    <div>
      <PageHeader title="Configurações" />

      <Card className="divide-y divide-border-soft">
        <div className="px-5 py-4">
          <p className="text-xs text-text-dim mb-0.5">Conta</p>
          <p className="text-sm">{APP_EMAIL}</p>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-medium text-sm">Sessão</p>
            <p className="text-text-dim text-xs mt-0.5">Sair neste dispositivo</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm font-medium text-danger hover:opacity-80 transition-opacity"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </Card>

      <p className="text-text-faint text-xs mt-4">
        Mais preferências (tema, senha, notificações) chegam conforme o sistema evolui.
      </p>
    </div>
  )
}
