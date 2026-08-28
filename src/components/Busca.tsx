import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MODULES } from '../lib/nav'
import { formatMoney } from '../lib/format'

/**
 * BUSCA GERAL.
 *
 * Uma caixa só que atravessa os módulos: acha a tarefa, a nota, o compromisso
 * ou o lançamento sem o Joshua ter que lembrar onde guardou.
 *
 * Abre com Ctrl+K (ou ⌘K) e pelo botão da Home.
 */

type Achado = {
  id: string
  titulo: string
  detalhe?: string
  modulo: string
  rota: string
  cor: string
}

const corDoModulo = (rota: string) =>
  MODULES.find((m) => m.path === rota)?.color ?? 'var(--color-text-dim)'

/** Escapa o termo: vírgula e parênteses têm significado na sintaxe do PostgREST. */
function termoSeguro(texto: string) {
  return texto.replace(/[,()*\\]/g, ' ').trim()
}

async function procurar(texto: string): Promise<Achado[]> {
  const termo = termoSeguro(texto)
  if (termo.length < 2) return []
  const like = `%${termo}%`

  const [tarefas, notas, eventos, lancamentos, metas] = await Promise.all([
    supabase.from('tasks').select('id,title,done,due_date').ilike('title', like).limit(6),
    supabase.from('notes').select('id,title,content').or(`title.ilike.${like},content.ilike.${like}`).limit(6),
    supabase.from('events').select('id,title,date,time').ilike('title', like).limit(6),
    supabase
      .from('transactions')
      .select('id,description,amount,type,date')
      .ilike('description', like)
      .limit(6),
    supabase.from('goals').select('id,title,progress').ilike('title', like).limit(4),
  ])

  const achados: Achado[] = []

  for (const t of tarefas.data ?? []) {
    achados.push({
      id: `t-${t.id}`,
      titulo: t.title,
      detalhe: t.done ? 'concluída' : 'pendente',
      modulo: 'Tarefas',
      rota: '/tarefas',
      cor: corDoModulo('/tarefas'),
    })
  }

  for (const n of notas.data ?? []) {
    achados.push({
      id: `n-${n.id}`,
      titulo: n.title || 'Sem título',
      detalhe: (n.content ?? '').slice(0, 60),
      modulo: 'Notas',
      rota: '/notas',
      cor: corDoModulo('/notas'),
    })
  }

  for (const e of eventos.data ?? []) {
    achados.push({
      id: `e-${e.id}`,
      titulo: e.title,
      detalhe:
        new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR') +
        (e.time ? ` às ${String(e.time).slice(0, 5)}` : ''),
      modulo: 'Agenda',
      rota: '/agenda',
      cor: corDoModulo('/agenda'),
    })
  }

  for (const l of lancamentos.data ?? []) {
    achados.push({
      id: `l-${l.id}`,
      titulo: l.description || 'Sem descrição',
      detalhe: `${l.type === 'income' ? '+' : '−'} ${formatMoney(Number(l.amount))}`,
      modulo: 'Finanças',
      rota: '/financas',
      cor: corDoModulo('/financas'),
    })
  }

  for (const g of metas.data ?? []) {
    achados.push({
      id: `g-${g.id}`,
      titulo: g.title,
      detalhe: `${g.progress}%`,
      modulo: 'Metas',
      rota: '/metas',
      cor: corDoModulo('/metas'),
    })
  }

  return achados
}

export default function Busca({ aberta, fechar }: { aberta: boolean; fechar: () => void }) {
  const [texto, setTexto] = useState('')
  const [achados, setAchados] = useState<Achado[]>([])
  const [buscando, setBuscando] = useState(false)
  const navigate = useNavigate()
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberta) {
      setTexto('')
      setAchados([])
      // O foco precisa esperar o elemento entrar na árvore.
      setTimeout(() => campo.current?.focus(), 60)
    }
  }, [aberta])

  // Espera o Joshua parar de digitar antes de ir ao banco.
  useEffect(() => {
    if (!aberta) return
    const termo = texto.trim()
    if (termo.length < 2) {
      setAchados([])
      setBuscando(false)
      return
    }

    setBuscando(true)
    let cancelado = false
    const timer = setTimeout(async () => {
      const r = await procurar(termo).catch(() => [])
      if (!cancelado) {
        setAchados(r)
        setBuscando(false)
      }
    }, 280)

    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [texto, aberta])

  const porModulo = useMemo(() => {
    const grupos = new Map<string, Achado[]>()
    for (const a of achados) {
      const lista = grupos.get(a.modulo)
      if (lista) lista.push(a)
      else grupos.set(a.modulo, [a])
    }
    return [...grupos.entries()]
  }, [achados])

  if (!aberta) return null

  const termoCurto = texto.trim().length > 0 && texto.trim().length < 2

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fechar} />

      <div className="tjv-pop relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-soft">
          <Search size={17} className="text-text-faint shrink-0" />
          <input
            ref={campo}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && fechar()}
            placeholder="Buscar tarefa, nota, compromisso, gasto..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-faint"
          />
          {buscando && <Loader2 size={15} className="text-text-faint animate-spin shrink-0" />}
          <button
            onClick={fechar}
            className="text-text-faint hover:text-text transition-colors shrink-0"
            aria-label="Fechar busca"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {termoCurto && (
            <p className="text-text-faint text-xs px-4 py-6 text-center">
              Escreva pelo menos duas letras.
            </p>
          )}

          {!termoCurto && !buscando && texto.trim().length >= 2 && achados.length === 0 && (
            <p className="text-text-dim text-sm px-4 py-8 text-center">
              Nada encontrado para "{texto.trim()}".
            </p>
          )}

          {texto.trim().length === 0 && (
            <p className="text-text-faint text-xs px-4 py-6 text-center">
              Procura em tarefas, notas, agenda, finanças e metas de uma vez.
            </p>
          )}

          {porModulo.map(([modulo, lista]) => (
            <div key={modulo}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-text-faint px-4 pt-3 pb-1">
                {modulo}
              </p>
              {lista.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    navigate(a.rota)
                    fechar()
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-2 transition-colors flex items-center gap-3"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: a.cor }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm truncate">{a.titulo}</span>
                    {a.detalhe && (
                      <span className="block text-xs text-text-faint truncate">{a.detalhe}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
