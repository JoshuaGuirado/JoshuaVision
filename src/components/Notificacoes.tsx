import { useEffect, useState } from 'react'
import { Bell, BellOff, Send, Smartphone } from 'lucide-react'
import { Card } from './ui'
import {
  ativar,
  desativar,
  diagnostico,
  enviarTeste,
  estaAtivo,
  nomeDoAparelho,
  type Diagnostico,
} from '../lib/notificacoes'

/**
 * LIGAR E DESLIGAR AS NOTIFICAÇÕES DESTE APARELHO.
 *
 * A parte importante aqui é o texto: quando não dá para ativar, o Joshua
 * precisa saber exatamente o que fazer — principalmente no iPhone, onde o site
 * tem que estar instalado na tela de início antes de qualquer coisa.
 */
export default function Notificacoes({ cor }: { cor: string }) {
  const [ativo, setAtivo] = useState(false)
  const [checando, setChecando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [problema, setProblema] = useState<Diagnostico | null>(null)
  const [recado, setRecado] = useState<string | null>(null)

  useEffect(() => {
    estaAtivo()
      .then(setAtivo)
      .finally(() => setChecando(false))
  }, [])

  const impedimento = diagnostico()

  async function ligar() {
    setOcupado(true)
    setRecado(null)
    const r = await ativar(nomeDoAparelho())
    if (r.ok) {
      setAtivo(true)
      setProblema(null)
      setRecado('Pronto! Este aparelho vai receber os avisos.')
    } else {
      setProblema(r)
    }
    setOcupado(false)
  }

  async function desligar() {
    setOcupado(true)
    await desativar()
    setAtivo(false)
    setRecado(null)
    setOcupado(false)
  }

  async function testar() {
    setOcupado(true)
    setRecado(null)
    const r = await enviarTeste()
    setRecado(r.ok ? 'Enviei — deve chegar em alguns segundos.' : (r.erro ?? 'Não consegui enviar.'))
    setOcupado(false)
  }

  return (
    <>
      <p className="text-xs uppercase tracking-[0.16em] text-text-faint mb-2 mt-6 px-1">
        Notificações
      </p>

      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <Smartphone size={18} className="mt-0.5 shrink-0" style={{ color: cor }} />
          <div className="min-w-0">
            <p className="font-medium text-sm">{nomeDoAparelho()}</p>
            <p className="text-text-dim text-xs mt-0.5">
              {checando
                ? 'Verificando...'
                : ativo
                  ? 'Recebendo o resumo do dia e os lembretes.'
                  : 'Este aparelho ainda não recebe avisos.'}
            </p>
          </div>
        </div>

        {/* Quando não dá para ativar, o passo a passo aparece no lugar do botão */}
        {!impedimento.ok && !ativo ? (
          <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-3.5">
            <p className="text-sm font-medium text-accent mb-1">{impedimento.motivo}</p>
            <p className="text-text-dim text-xs leading-relaxed">{impedimento.comoResolver}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={ativo ? desligar : ligar}
              disabled={ocupado || checando}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
                         transition-colors disabled:opacity-50"
              style={
                ativo
                  ? { border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
                  : { backgroundColor: cor, color: '#fff' }
              }
            >
              {ativo ? <BellOff size={15} /> : <Bell size={15} />}
              {ativo ? 'Desligar' : 'Ativar'}
            </button>

            <button
              onClick={testar}
              disabled={ocupado || !ativo}
              className="flex items-center justify-center gap-2 rounded-xl border border-border
                         py-2.5 text-sm font-semibold text-text-dim
                         hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
            >
              <Send size={14} /> Testar
            </button>
          </div>
        )}

        {problema && !problema.ok && (
          <div className="mt-3 rounded-xl border border-danger/40 bg-danger/5 p-3.5">
            <p className="text-sm font-medium text-danger mb-1">{problema.motivo}</p>
            <p className="text-text-dim text-xs leading-relaxed">{problema.comoResolver}</p>
          </div>
        )}

        {recado && <p className="mt-3 text-xs text-text-dim">{recado}</p>}

        <p className="mt-4 pt-4 border-t border-border-soft text-[11px] text-text-faint leading-relaxed">
          Todo dia de manhã os Vingadores mandam o resumo: seus compromissos do dia e quantas
          tarefas estão pendentes. Você precisa ativar em cada aparelho separadamente.
        </p>
      </Card>
    </>
  )
}
