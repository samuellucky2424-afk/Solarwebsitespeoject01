alter table if exists public.profiles
  add column if not exists suspended boolean not null default false,
  add column if not exists failed_login_attempts integer not null default 0,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and coalesce(suspended, false) = false
  );
$$;

grant execute on function public.is_admin_user() to anon, authenticated, service_role;

create or replace function public.is_active_user(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and coalesce(suspended, false) = false
  );
$$;

grant execute on function public.is_active_user(uuid) to anon, authenticated, service_role;

revoke execute on function public.record_failed_login_attempt(text) from anon, authenticated, public;

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() and public.is_active_user(auth.uid()))
  with check (id = auth.uid() and public.is_active_user(auth.uid()));

drop policy if exists "Users can read own hub rows" on public.greenlife_hub;
create policy "Users can read own hub rows"
  on public.greenlife_hub
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_active_user(auth.uid()));

drop policy if exists "Authenticated users can create own requests" on public.greenlife_hub;
create policy "Authenticated users can create own requests"
  on public.greenlife_hub
  for insert
  to authenticated
  with check (
    type = 'request'
    and user_id = auth.uid()
    and public.is_active_user(auth.uid())
  );

drop policy if exists "Users can update own hub profile rows" on public.greenlife_hub;
create policy "Users can update own hub profile rows"
  on public.greenlife_hub
  for update
  to authenticated
  using (
    type = 'user_profile'
    and user_id = auth.uid()
    and public.is_active_user(auth.uid())
  )
  with check (
    type = 'user_profile'
    and user_id = auth.uid()
    and public.is_active_user(auth.uid())
  );

drop policy if exists "Users can create own verification requests" on public.role_verification_requests;
create policy "Users can create own verification requests"
  on public.role_verification_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and role_requested in ('installer', 'retailer')
    and public.is_active_user(auth.uid())
  );

drop policy if exists "Users can read own verification requests" on public.role_verification_requests;
create policy "Users can read own verification requests"
  on public.role_verification_requests
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_active_user(auth.uid()));

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_active_user(auth.uid()));

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_active_user(auth.uid()));

drop policy if exists "Users can read own order status history" on public.order_status_history;
create policy "Users can read own order status history"
  on public.order_status_history
  for select
  to authenticated
  using (
    public.is_active_user(auth.uid())
    and exists (
      select 1
      from public.orders o
      where o.id = order_status_history.order_id
        and o.user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('greenlife-verifications', 'greenlife-verifications', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own verification files" on storage.objects;
create policy "Users can upload own verification files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'greenlife-verifications'
    and split_part(name, '/', 1) = auth.uid()::text
    and public.is_active_user(auth.uid())
  );

drop policy if exists "Users can read own verification files" on storage.objects;
create policy "Users can read own verification files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'greenlife-verifications'
    and split_part(name, '/', 1) = auth.uid()::text
    and public.is_active_user(auth.uid())
  );

drop policy if exists "Admins can read verification files" on storage.objects;
create policy "Admins can read verification files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'greenlife-verifications'
    and public.is_admin_user()
  );

drop policy if exists "Admins can manage verification files" on storage.objects;
create policy "Admins can manage verification files"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'greenlife-verifications'
    and public.is_admin_user()
  )
  with check (
    bucket_id = 'greenlife-verifications'
    and public.is_admin_user()
  );
