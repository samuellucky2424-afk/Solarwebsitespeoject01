alter table public.orders
  add column if not exists fulfillment_status text not null default 'pending',
  add column if not exists fulfillment_updated_at timestamptz not null default now(),
  add column if not exists delivered_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_fulfillment_status_check'
  ) then
    alter table public.orders
      add constraint orders_fulfillment_status_check
      check (fulfillment_status in ('pending', 'confirmed', 'in_transit', 'delivered'));
  end if;
end $$;

update public.orders
set
  fulfillment_status = case
    when coalesce(fulfillment_status, '') in ('pending', 'confirmed', 'in_transit', 'delivered') then fulfillment_status
    else 'pending'
  end,
  fulfillment_updated_at = coalesce(fulfillment_updated_at, created_at, now()),
  delivered_at = case
    when fulfillment_status = 'delivered' then coalesce(delivered_at, fulfillment_updated_at, created_at, now())
    else delivered_at
  end;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  next_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text
);

create index if not exists order_status_history_order_id_idx
  on public.order_status_history (order_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_status_history_next_status_check'
  ) then
    alter table public.order_status_history
      add constraint order_status_history_next_status_check
      check (next_status in ('pending', 'confirmed', 'in_transit', 'delivered'));
  end if;
end $$;

insert into public.order_status_history (order_id, previous_status, next_status, changed_by, note, created_at)
select
  o.id,
  null,
  o.fulfillment_status,
  null,
  'Initial fulfillment status',
  coalesce(o.fulfillment_updated_at, o.created_at, now())
from public.orders o
where not exists (
  select 1
  from public.order_status_history h
  where h.order_id = o.id
);

alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can read own order status history" on public.order_status_history;
create policy "Users can read own order status history"
  on public.order_status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_status_history.order_id
        and o.user_id = auth.uid()
    )
  );
