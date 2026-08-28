import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useFx } from './fx'
import { useHeroVoice } from './heroVoice'
import { useHeroColor } from './nav'

type Order = { column: string; ascending?: boolean }

/**
 * CRUD genérico sobre uma tabela do Supabase.
 *
 * Todos os módulos seguem o mesmo formato (linhas do usuário logado, ordenadas),
 * então centralizar aqui evita repetir carregamento, tratamento de erro e
 * `user_id` em cada tela.
 */
export function useCollection<T extends { id: string }>(table: string, order: Order) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Criar algo estoura a onomatopeia do herói do módulo. Fica aqui, e não em
  // cada página, para os doze módulos ganharem o efeito de uma vez.
  const fx = useFx()
  const voice = useHeroVoice()
  const cor = useHeroColor()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(order.column, { ascending: order.ascending ?? true })

    if (err) {
      setError(
        err.message.includes('schema cache')
          ? 'Tabela não encontrada. Rode o schema-modules.sql no Supabase.'
          : 'Não consegui carregar os dados.',
      )
    } else {
      setItems((data ?? []) as T[])
    }
    setLoading(false)
    // `order` é um objeto literal recriado a cada render; depender dos campos
    // evita recarregar em loop.
  }, [table, order.column, order.ascending])

  // `versaoDados` faz a lista recarregar quando algo é criado por fora (o
  // botão de adicionar rápido, por exemplo).
  useEffect(() => {
    load()
  }, [load, fx.versaoDados])

  async function create(values: Record<string, unknown>) {
    const { data: userData } = await supabase.auth.getUser()
    // Sessão expirada: sem esta checagem o app quebrava com "Cannot read
    // properties of null" ao salvar, sem dizer nada ao Joshua.
    if (!userData.user) throw new Error('Sua sessão expirou. Entre de novo para salvar.')

    const { error: err } = await supabase
      .from(table)
      .insert({ ...values, user_id: userData.user.id })
    if (err) throw err
    if (voice) fx.bang(voice.bang, cor, voice.bangKind)
    await load()
  }

  async function update(id: string, values: Record<string, unknown>) {
    const { error: err } = await supabase.from(table).update(values).eq('id', id)
    if (err) throw err
    // Concluir também merece estouro; desmarcar, não.
    const concluiu = values.done === true || values.completed === true
    if (concluiu && voice) fx.bang(voice.bang, cor, voice.bangKind)
    await load()
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from(table).delete().eq('id', id)
    if (err) throw err
    await load()
  }

  return { items, loading, error, reload: load, create, update, remove }
}
