-- Rode este script no Supabase: Project > SQL Editor > New query > Run

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#f5c518',
  monthly_budget numeric,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category_id uuid references categories(id) on delete set null,
  description text not null default '',
  date date not null default current_date,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on transactions (user_id, date desc);
create index if not exists categories_user_idx on categories (user_id);

alter table categories enable row level security;
alter table transactions enable row level security;

create policy "own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
