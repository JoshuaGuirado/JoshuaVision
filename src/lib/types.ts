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
  /** Em qual conta o dinheiro entrou ou saiu. Opcional: lançamentos antigos
   *  não tinham conta. */
  account_id: string | null
  description: string
  date: string
  is_recurring: boolean
  created_at: string
}

/** Onde o dinheiro fica: banco, carteira, cartão. */
export type AccountKind = 'corrente' | 'poupanca' | 'carteira' | 'cartao' | 'outro'

export type Account = {
  id: string
  user_id: string
  name: string
  kind: AccountKind
  color: string
  /** Quanto já havia na conta antes de o Joshua começar a usar o site. */
  initial_balance: number
  created_at: string
}

export type InvestmentKind = 'renda_fixa' | 'acoes' | 'fii' | 'cripto' | 'fundo' | 'outro'

export type Investment = {
  id: string
  user_id: string
  name: string
  kind: InvestmentKind
  /** Quanto vale hoje — atualizado à mão quando o Joshua quiser. */
  current_value: number
  notes: string
  created_at: string
}

/** Cada vez que o Joshua coloca dinheiro num investimento. */
export type InvestmentEntry = {
  id: string
  user_id: string
  investment_id: string
  amount: number
  date: string
  created_at: string
}

export type FinancialGoal = {
  id: string
  user_id: string
  title: string
  target_amount: number
  saved_amount: number
  deadline: string | null
  color: string
  created_at: string
}
