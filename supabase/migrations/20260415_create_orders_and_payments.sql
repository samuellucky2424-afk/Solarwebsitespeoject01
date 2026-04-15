create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  item_id uuid,
  item_snapshot jsonb,
  amount numeric not null,
  currency text not null default 'NGN',
  status text not null default 'pending',
  tx_ref text not null unique
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null default 'flutterwave',
  flutterwave_transaction_id text not null unique,
  tx_ref text not null unique,
  amount numeric not null,
  currency text not null default 'NGN',
  status text not null,
  raw jsonb,
  verified_at timestamptz
);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
