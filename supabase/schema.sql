-- FinanceOS — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase

-- Extensões
create extension if not exists "uuid-ossp";

-- ── CENTROS DE CUSTO ──────────────────────────────────────
create table if not exists cost_centers (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  name          text not null,
  color         text not null default '#4f6ef7',
  icon          text not null default '💼',
  created_at    timestamptz default now()
);

-- ── CATEGORIAS ────────────────────────────────────────────
create table if not exists categories (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  name           text not null,
  color          text not null default '#888',
  type           text check (type in ('income','expense')) not null,
  cost_center_id uuid references cost_centers on delete set null,
  created_at     timestamptz default now()
);

-- ── SUBCATEGORIAS ─────────────────────────────────────────
create table if not exists category_subs (
  id          uuid default gen_random_uuid() primary key,
  category_id uuid references categories on delete cascade not null,
  name        text not null
);

-- ── CARTÕES DE CRÉDITO ────────────────────────────────────
create table if not exists credit_cards (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  name           text not null,
  last_four      text not null,
  color          text not null default '#3b82f6',
  closing_day    int  not null default 15,
  due_day        int  not null default 22,
  limit_amount   numeric not null default 0,
  current_bill   numeric not null default 0,
  status         text check (status in ('open','pending','paid')) default 'open',
  cost_center_id uuid references cost_centers on delete set null,
  created_at     timestamptz default now()
);

-- ── LANÇAMENTOS ───────────────────────────────────────────
create table if not exists transactions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  description    text not null,
  amount         numeric not null,
  type           text check (type in ('income','expense')) not null,
  category_id    uuid references categories on delete set null,
  sub_id         uuid references category_subs on delete set null,
  cost_center_id uuid references cost_centers on delete set null,
  card_id        uuid references credit_cards on delete set null,
  date           date not null default current_date,
  confirmed      boolean default true,
  created_at     timestamptz default now()
);

-- ── METAS ─────────────────────────────────────────────────
create table if not exists goals (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null,
  name           text not null,
  target         numeric not null,
  current        numeric not null default 0,
  deadline       text,
  color          text not null default '#22c55e',
  icon           text not null default '🎯',
  cost_center_id uuid references cost_centers on delete set null,
  created_at     timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table cost_centers  enable row level security;
alter table categories    enable row level security;
alter table category_subs enable row level security;
alter table credit_cards  enable row level security;
alter table transactions  enable row level security;
alter table goals         enable row level security;

-- Políticas: cada usuário vê e gerencia apenas seus próprios dados
create policy "cost_centers_own"  on cost_centers  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_own"    on categories    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "category_subs_own" on category_subs for all using (
  category_id in (select id from categories where user_id = auth.uid())
);
create policy "credit_cards_own"  on credit_cards  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_own"  on transactions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_own"         on goals         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── ÍNDICES PARA PERFORMANCE ──────────────────────────────
create index if not exists idx_transactions_user_date on transactions (user_id, date desc);
create index if not exists idx_transactions_category  on transactions (category_id);
create index if not exists idx_transactions_card      on transactions (card_id);
create index if not exists idx_categories_user        on categories (user_id);
