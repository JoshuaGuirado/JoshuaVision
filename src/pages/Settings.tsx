import { useEffect, useState } from 'react'
import { LogOut, Volume2, Mic, Sparkles, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, Card, Select } from '../components/ui'
import { APP_EMAIL } from '../lib/supabase'
import { useFx, vozesDisponiveis } from '../lib/fx'
import { useHeroColor } from '../lib/nav'
import { HERO_VOICES } from '../lib/heroVoice'
import Notificacoes from '../components/Notificacoes'

/** Interruptor liga/desliga no estilo do site. */
function Switch({
  ligado,
  onChange,
  cor,
  rotulo,
}: {
  ligado: boolean
  onChange: (v: boolean) => void
  cor: string
  rotulo: string
}) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onChange(!ligado)}
      className="relative h-6 w-11 shrink-0 rounded-full border transition-colors"
      style={{
        backgroundColor: ligado ? cor : 'transparent',
        borderColor: ligado ? cor : 'var(--color-border)',
      }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: ligado ? 22 : 3 }}
      />
    </button>
  )
}

export default function Settings() {
  const { signOut } = useAuth()
  const { prefs, setPref, bang, speak, preview } = useFx()
  const cor = useHeroColor()

  return (
    <div>
      <PageHeader title="Configurações" />

      <Card className="divide-y divide-border-soft mb-4">
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

      {/* ---- Efeitos: som e voz vêm desligados de propósito ---- */}
      <p className="text-xs uppercase tracking-[0.16em] text-text-faint mb-2 px-1">
        Efeitos do esquadrão
      </p>

      <Card className="divide-y divide-border-soft">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: cor }} />
            <div>
              <p className="font-medium text-sm">Animações e estouros</p>
              <p className="text-text-dim text-xs mt-0.5">
                O "SMASH!" na tela quando você cria ou conclui algo.
              </p>
            </div>
          </div>
          <Switch
            ligado={prefs.motion}
            cor={cor}
            rotulo="Animações"
            onChange={(v) => {
              setPref('motion', v)
              if (v) bang('BOOM!', cor, 'impact')
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <Volume2 size={16} className="mt-0.5 shrink-0" style={{ color: cor }} />
            <div>
              <p className="font-medium text-sm">Som das ações</p>
              <p className="text-text-dim text-xs mt-0.5">
                Escudo, trovão, teia. Curtinhos — e só se você quiser.
              </p>
            </div>
          </div>
          <Switch
            ligado={prefs.sound}
            cor={cor}
            rotulo="Som"
            onChange={(v) => {
              setPref('sound', v)
              // amostra imediata: `preview` toca sem depender da preferência,
              // que só chega no próximo render
              if (v) preview('shield')
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <Mic size={16} className="mt-0.5 shrink-0" style={{ color: cor }} />
            <div>
              <p className="font-medium text-sm">Herói falando em voz alta</p>
              <p className="text-text-dim text-xs mt-0.5">
                Usa a voz do próprio aparelho. Pode soar robótica — teste antes de deixar ligado.
              </p>
            </div>
          </div>
          <Switch
            ligado={prefs.voice}
            cor={cor}
            rotulo="Voz"
            onChange={(v) => {
              setPref('voice', v)
              if (v) speak('Voz ativada, Joshua. Estou com você.', undefined, true)
            }}
          />
        </div>

        {/* A escolha de voz só aparece com a voz ligada: sem ela, não serve
            para nada e só ocupa a tela. */}
        {prefs.voice && <EscolhaDeVozes cor={cor} />}
      </Card>

      <Notificacoes cor={cor} />

      <p className="text-text-faint text-xs mt-4">
        As preferências ficam guardadas neste aparelho. Mais opções (tema, senha, notificações)
        chegam conforme o sistema evolui.
      </p>
    </div>
  )
}

/**
 * ESCOLHA DAS VOZES.
 *
 * O aparelho traz poucas vozes em português (o computador do Joshua tem duas:
 * uma masculina e uma feminina). O que diferencia um herói do outro é o tom e
 * a velocidade, definidos em `heroVoice.ts` — aqui ele escolhe só as duas
 * vozes-base e ouve como cada herói fica.
 */
function EscolhaDeVozes({ cor }: { cor: string }) {
  const { prefs, setPref, speak } = useFx()
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[]>([])

  // A lista chega vazia na primeira chamada em vários navegadores: ela é
  // preenchida depois, e o evento avisa quando isso acontece.
  useEffect(() => {
    const atualizar = () => setVozes(vozesDisponiveis())
    atualizar()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', atualizar)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', atualizar)
    }
  }, [])

  if (vozes.length === 0) {
    return (
      <div className="px-5 py-4">
        <p className="text-text-dim text-xs">
          Este aparelho não ofereceu nenhuma voz. Tente pelo celular ou por outro navegador.
        </p>
      </div>
    )
  }

  const amostras = [
    { path: '/habitos', rotulo: 'Thor' },
    { path: '/metas', rotulo: 'Homem-Aranha' },
    { path: '/financas', rotulo: 'Capitão' },
    { path: '/assistente', rotulo: 'F.R.I.D.A.Y.' },
  ]

  return (
    <div className="px-5 py-4 space-y-4">
      <p className="text-text-dim text-xs">
        Seu aparelho tem {vozes.length} voz{vozes.length === 1 ? '' : 'es'} disponível
        {vozes.length === 1 ? '' : 'is'}. Cada herói usa uma delas com tom e velocidade próprios.
      </p>

      <Select
        label="Voz dos heróis (masculina)"
        value={prefs.vozMasculina ?? ''}
        onChange={(e) => setPref('vozMasculina', e.target.value || undefined)}
      >
        <option value="">Escolher automaticamente</option>
        {vozes.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </Select>

      <Select
        label="Voz das heroínas e da F.R.I.D.A.Y."
        value={prefs.vozFeminina ?? ''}
        onChange={(e) => setPref('vozFeminina', e.target.value || undefined)}
      >
        <option value="">Escolher automaticamente</option>
        {vozes.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </Select>

      <div>
        <p className="text-xs text-text-dim mb-2">Ouça como cada um ficou:</p>
        <div className="flex flex-wrap gap-2">
          {amostras.map(({ path, rotulo }) => {
            const heroi = HERO_VOICES[path]
            return (
              <button
                key={path}
                type="button"
                onClick={() => speak(heroi.greeting, heroi.voz, true)}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold
                           transition-colors hover:bg-surface-2"
                style={{ color: cor, borderColor: `${cor}55` }}
              >
                <Play size={12} /> {rotulo}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
