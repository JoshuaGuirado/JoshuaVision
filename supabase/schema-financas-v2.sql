-- FINANÇAS — SEGUNDA PARTE (contas, investimentos e metas)
--
-- Rode no Supabase: Project > SQL Editor > New query > cole tudo > Run.
-- Pode rodar mais de uma vez sem problema: nada é apagado nem duplicado.

-- ---------------------------------------------------------------------------
-- CONTAS — onde o dinheiro fica (banco, carteira, cartão)
-- ---------------------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'corrente'
    check (kind in ('corrente', 'poupanca', 'carteira', 'cartao', 'outro')),
  color text not null default '#4d8ff0',
  -- quanto já havia na conta antes de o Joshua começar a usar o site
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Cada lançamento pode dizer de qual conta saiu/entrou. Fica opcional para os
-- lançamentos antigos continuarem valendo.
alter table transactions add column if not exists account_id uuid references accounts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- INVESTIMENTOS — o que está aplicado, e quanto foi colocado nele
-- ---------------------------------------------------------------------------
create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'renda_fixa'
    check (kind in ('renda_fixa', 'acoes', 'fii', 'cripto', 'fundo', 'outro')),
  -- quanto vale hoje; o Joshua atualiza quando quiser
  current_value numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Cada vez que ele coloca dinheiro num investimento vira uma linha aqui. É o
-- que responde "quanto eu já adicionei" sem depender de ele fazer a conta.
create table if not exists investment_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_id uuid not null references investments(id) on delete cascade,
  amount numeric not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- METAS FINANCEIRAS — juntar dinheiro para alguma coisa
-- ---------------------------------------------------------------------------
create table if not exists financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0,
  deadline date,
  color text not null default '#ec1d24',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices e segurança
-- ---------------------------------------------------------------------------
create index if not exists accounts_user_idx on accounts (user_id);
create index if not exists investments_user_idx on investments (user_id);
create index if not exists investment_entries_user_date_idx on investment_entries (user_id, date desc);
create index if not exists financial_goals_user_idx on financial_goals (user_id);

alter table accounts enable row level security;
alter table investments enable row level security;
alter table investment_entries enable row level security;
alter table financial_goals enable row level security;

-- `drop policy if exists` antes de criar deixa o script seguro para rodar de novo.
drop policy if exists "own accounts" on accounts;
create policy "own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own investments" on investments;
create policy "own investments" on investments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own investment_entries" on investment_entries;
create policy "own investment_entries" on investment_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own financial_goals" on financial_goals;
create policy "own financial_goals" on financial_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
