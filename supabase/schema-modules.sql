-- Tabelas dos módulos novos do THE JOSHUA VISION.
-- Rode no Supabase: Project > SQL Editor > New query > Run
-- (o schema.sql original, com categories/transactions, continua valendo)

-- AGENDA ---------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text not null default '',
  date date not null,
  time time,
  created_at timestamptz not null default now()
);

-- TAREFAS --------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  priority text not null default 'media' check (priority in ('baixa', 'media', 'alta')),
  due_date date,
  created_at timestamptz not null default now()
);

-- METAS ----------------------------------------------------------------
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  deadline date,
  created_at timestamptz not null default now()
);

-- HÁBITOS --------------------------------------------------------------
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#8e5bef',
  created_at timestamptz not null default now()
);

-- Uma linha por dia concluído; o par (hábito, dia) é único.
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  unique (habit_id, date)
);

-- PROJETOS -------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text not null default '',
  status text not null default 'ativo' check (status in ('ideia', 'ativo', 'pausado', 'concluido')),
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

-- ESTUDOS --------------------------------------------------------------
create table if not exists studies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  topic text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  hours numeric not null default 0,
  created_at timestamptz not null default now()
);

-- SAÚDE ----------------------------------------------------------------
-- Um registro por dia com as métricas que o Joshua quiser preencher.
create table if not exists health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  sleep_hours numeric,
  water_ml int,
  workout boolean not null default false,
  notes text not null default '',
  unique (user_id, date)
);

-- NOTAS ----------------------------------------------------------------
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ÍNDICES --------------------------------------------------------------
create index if not exists events_user_date_idx on events (user_id, date);
create index if not exists tasks_user_idx on tasks (user_id, done, due_date);
create index if not exists goals_user_idx on goals (user_id);
create index if not exists habits_user_idx on habits (user_id);
create index if not exists habit_logs_user_idx on habit_logs (user_id, habit_id, date);
create index if not exists projects_user_idx on projects (user_id);
create index if not exists studies_user_idx on studies (user_id);
create index if not exists health_logs_user_idx on health_logs (user_id, date desc);
create index if not exists notes_user_idx on notes (user_id, updated_at desc);

-- SEGURANÇA ------------------------------------------------------------
-- Cada tabela só deixa o dono ver e mexer nas próprias linhas.
alter table events enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table projects enable row level security;
alter table studies enable row level security;
alter table health_logs enable row level security;
alter table notes enable row level security;

drop policy if exists "own events" on events;
create policy "own events" on events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own tasks" on tasks;
create policy "own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own goals" on goals;
create policy "own goals" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own habits" on habits;
create policy "own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own habit_logs" on habit_logs;
create policy "own habit_logs" on habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own projects" on projects;
create policy "own projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own studies" on studies;
create policy "own studies" on studies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own health_logs" on health_logs;
create policy "own health_logs" on health_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own notes" on notes;
create policy "own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
