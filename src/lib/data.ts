import { supabase } from './supabase'
import type { Category, Transaction, TransactionType } from './types'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data as Category[]
}

export async function createCategory(input: {
  name: string
  icon: string
  color: string
  monthly_budget: number | null
}) {
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase.from('categories').insert({
    ...input,
    user_id: userData.user!.id,
  })
  if (error) throw error
}

export async function updateCategory(id: string, input: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) {
  const { error } = await supabase.from('categories').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data as Transaction[]
}

export async function createTransaction(input: {
  type: TransactionType
  amount: number
  category_id: string | null
  description: string
  date: string
  is_recurring: boolean
}) {
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase.from('transactions').insert({
    ...input,
    user_id: userData.user!.id,
  })
  if (error) throw error
}

export async function updateTransaction(
  id: string,
  input: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>,
) {
  const { error } = await supabase.from('transactions').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
