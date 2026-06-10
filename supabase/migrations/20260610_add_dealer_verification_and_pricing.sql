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
  );
$$;

grant execute on function public.is_admin_user() to anon, authenticated;

create or replace function public.is_dealer_or_admin()
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
      and role in ('admin', 'installer', 'retailer')
      and coalesce(suspended, false) = false
  );
$$;

grant execute on function public.is_dealer_or_admin() to anon, authenticated;

create table if not exists public.role_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_requested text not null check (role_requested in ('installer', 'retailer')),
  business_name text not null,
  business_address text not null,
  cac_document_url text,
  id_document_url text,
  store_photo_url text,
  store_video_url text,
  work_photo_url text,
  work_video_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint role_verification_required_files check (
    (
      role_requested = 'installer'
      and cac_document_url is not null
      and work_photo_url is not null
      and work_video_url is not null
    )
    or
    (
      role_requested = 'retailer'
      and id_document_url is not null
      and store_photo_url is not null
      and store_video_url is not null
    )
  )
);

alter table public.role_verification_requests enable row level security;

drop policy if exists "Users can create own verification requests" on public.role_verification_requests;
create policy "Users can create own verification requests"
  on public.role_verification_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and role_requested in ('installer', 'retailer')
  );

drop policy if exists "Users can read own verification requests" on public.role_verification_requests;
create policy "Users can read own verification requests"
  on public.role_verification_requests
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can manage verification requests" on public.role_verification_requests;
create policy "Admins can manage verification requests"
  on public.role_verification_requests
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

create table if not exists public.dealer_prices (
  product_id uuid primary key references public.greenlife_hub(id) on delete cascade,
  installer_price numeric,
  retailer_price numeric,
  updated_at timestamptz not null default now()
);

alter table public.dealer_prices enable row level security;

drop policy if exists "Dealers can read dealer prices" on public.dealer_prices;
create policy "Dealers can read dealer prices"
  on public.dealer_prices
  for select
  to authenticated
  using (public.is_dealer_or_admin());

drop policy if exists "Admins can manage dealer prices" on public.dealer_prices;
create policy "Admins can manage dealer prices"
  on public.dealer_prices
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

insert into storage.buckets (id, name, public)
values ('greenlife-assets', 'greenlife-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read greenlife assets" on storage.objects;
create policy "Public can read greenlife assets"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'greenlife-assets');

drop policy if exists "Authenticated users can upload greenlife assets" on storage.objects;
create policy "Authenticated users can upload greenlife assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'greenlife-assets');

drop policy if exists "Admins can manage greenlife assets" on storage.objects;
create policy "Admins can manage greenlife assets"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'greenlife-assets' and public.is_admin_user())
  with check (bucket_id = 'greenlife-assets' and public.is_admin_user());

create or replace function public.record_failed_login_attempt(login_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_profile public.profiles%rowtype;
  next_attempts integer;
begin
  select *
    into matched_profile
    from public.profiles
    where lower(email) = lower(trim(login_email))
      and role <> 'admin'
    limit 1;

  if not found then
    return jsonb_build_object('tracked', false);
  end if;

  next_attempts := coalesce(matched_profile.failed_login_attempts, 0) + 1;

  update public.profiles
    set failed_login_attempts = next_attempts,
        suspended = case when next_attempts >= 5 then true else suspended end,
        suspended_at = case when next_attempts >= 5 and not suspended then now() else suspended_at end,
        suspension_reason = case
          when next_attempts >= 5 then 'Too many failed login attempts'
          else suspension_reason
        end
    where id = matched_profile.id;

  return jsonb_build_object(
    'tracked', true,
    'failed_login_attempts', next_attempts,
    'suspended', next_attempts >= 5
  );
end;
$$;

revoke execute on function public.record_failed_login_attempt(text) from anon, authenticated, public;

create or replace function public.reset_failed_login_attempts(profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> profile_id and not public.is_admin_user() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  update public.profiles
    set failed_login_attempts = 0
    where id = profile_id
      and coalesce(suspended, false) = false;
end;
$$;

grant execute on function public.reset_failed_login_attempts(uuid) to authenticated;
