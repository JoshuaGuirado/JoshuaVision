import { supabase } from './supabase'
import type {
  Account,
  Category,
  FinancialGoal,
  Investment,
  InvestmentEntry,
  Transaction,
  TransactionType,
} from './types'

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
  account_id?: string | null
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

// ---------------------------------------------------------------------------
// CONTAS
// ---------------------------------------------------------------------------

/** Id do usuário logado, ou um erro claro se a sessão caiu. */
async function usuarioAtual(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Sua sessão expirou. Entre de novo para salvar.')
  return data.user.id
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from('accounts').select('*').order('name')
  if (error) throw error
  return data as Account[]
}

export async function createAccount(input: {
  name: string
  kind: Account['kind']
  color: string
  initial_balance: number
}) {
  const { error } = await supabase.from('accounts').insert({ ...input, user_id: await usuarioAtual() })
  if (error) throw error
}

export async function updateAccount(id: string, input: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>) {
  const { error } = await supabase.from('accounts').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// INVESTIMENTOS
// ---------------------------------------------------------------------------

export async function fetchInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase.from('investments').select('*').order('name')
  if (error) throw error
  return data as Investment[]
}

export async function createInvestment(input: {
  name: string
  kind: Investment['kind']
  current_value: number
  notes: string
}) {
  const { data, error } = await supabase
    .from('investments')
    .insert({ ...input, user_id: await usuarioAtual() })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateInvestment(
  id: string,
  input: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>,
) {
  const { error } = await supabase.from('investments').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteInvestment(id: string) {
  const { error } = await supabase.from('investments').delete().eq('id', id)
  if (error) throw error
}

export async function fetchInvestmentEntries(): Promise<InvestmentEntry[]> {
  const { data, error } = await supabase
    .from('investment_entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data as InvestmentEntry[]
}

export async function createInvestmentEntry(input: {
  investment_id: string
  amount: number
  date: string
}) {
  const { error } = await supabase
    .from('investment_entries')
    .insert({ ...input, user_id: await usuarioAtual() })
  if (error) throw error
}

export async function deleteInvestmentEntry(id: string) {
  const { error } = await supabase.from('investment_entries').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// METAS FINANCEIRAS
// ---------------------------------------------------------------------------

export async function fetchFinancialGoals(): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FinancialGoal[]
}

export async function createFinancialGoal(input: {
  title: string
  target_amount: number
  saved_amount: number
  deadline: string | null
  color: string
}) {
  const { error } = await supabase
    .from('financial_goals')
    .insert({ ...input, user_id: await usuarioAtual() })
  if (error) throw error
}

export async function updateFinancialGoal(
  id: string,
  input: Partial<Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>>,
) {
  const { error } = await supabase.from('financial_goals').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteFinancialGoal(id: string) {
  const { error } = await supabase.from('financial_goals').delete().eq('id', id)
  if (error) throw error
}
