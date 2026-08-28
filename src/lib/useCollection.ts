import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

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

  useEffect(() => {
    load()
  }, [load])

  async function create(values: Record<string, unknown>) {
    const { data: userData } = await supabase.auth.getUser()
    const { error: err } = await supabase
      .from(table)
      .insert({ ...values, user_id: userData.user!.id })
    if (err) throw err
    await load()
  }

  async function update(id: string, values: Record<string, unknown>) {
    const { error: err } = await supabase.from(table).update(values).eq('id', id)
    if (err) throw err
    await load()
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from(table).delete().eq('id', id)
    if (err) throw err
    await load()
  }

  return { items, loading, error, reload: load, create, update, remove }
}
