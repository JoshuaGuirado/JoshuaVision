export type TransactionType = 'income' | 'expense'

export type Category = {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  monthly_budget: number | null
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category_id: string | null
  description: string
  date: string
  is_recurring: boolean
  created_at: string
}
