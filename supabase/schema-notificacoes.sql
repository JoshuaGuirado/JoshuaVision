-- NOTIFICAÇÕES PUSH
--
-- Rode no Supabase: Project > SQL Editor > New query > cole tudo > Run.
-- Pode rodar mais de uma vez sem problema.

-- Cada aparelho que aceitou receber notificação vira uma linha aqui. O mesmo
-- Joshua pode ter várias: iPhone, computador de casa, computador do trabalho.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- endereço único que o navegador dá para o servidor entregar a mensagem
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  -- só para o Joshua reconhecer o aparelho na lista
  apelido text not null default '',
  created_at timestamptz not null default now()
);

-- O que ele quer receber e a que horas.
create table if not exists notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- horário do resumo diário, no fuso de Brasília
  hora_resumo int not null default 8 check (hora_resumo between 0 and 23),
  resumo_diario boolean not null default true,
  avisar_compromissos boolean not null default true,
  avisar_tarefas boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;
alter table notification_prefs enable row level security;

drop policy if exists "own push_subscriptions" on push_subscriptions;
create policy "own push_subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own notification_prefs" on notification_prefs;
create policy "own notification_prefs" on notification_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
