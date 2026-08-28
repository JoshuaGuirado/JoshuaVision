import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogoFull } from '../components/Logo'

export default function Login() {
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(password)
    if (err) setError('Senha incorreta.')
    setLoading(false)
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-xs">
        <div className="mb-12">
          <LogoFull />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-center text-text placeholder:text-text-dim outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-danger text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-accent text-black font-semibold py-3 disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
