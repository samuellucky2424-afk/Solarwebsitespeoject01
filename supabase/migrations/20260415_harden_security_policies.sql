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

alter table if exists public.profiles enable row level security;
alter table if exists public.greenlife_hub enable row level security;
alter table if exists public.live_chat_conversations enable row level security;
alter table if exists public.live_chat_messages enable row level security;

drop policy if exists "Allow public read access" on public.greenlife_hub;
drop policy if exists "Allow public write access" on public.greenlife_hub;
drop policy if exists "Allow public update access" on public.greenlife_hub;
drop policy if exists "Allow public delete access" on public.greenlife_hub;

drop policy if exists "Allow anonymous read" on public.live_chat_conversations;
drop policy if exists "Allow anonymous insert" on public.live_chat_conversations;
drop policy if exists "Allow anonymous read messages" on public.live_chat_messages;
drop policy if exists "Allow anonymous insert messages" on public.live_chat_messages;
drop policy if exists "Allow update messages" on public.live_chat_messages;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read catalog rows" on public.greenlife_hub;
create policy "Public can read catalog rows"
  on public.greenlife_hub
  for select
  to anon, authenticated
  using (type in ('product', 'package', 'gallery'));

drop policy if exists "Users can read own hub rows" on public.greenlife_hub;
create policy "Users can read own hub rows"
  on public.greenlife_hub
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can manage hub rows" on public.greenlife_hub;
create policy "Admins can manage hub rows"
  on public.greenlife_hub
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Authenticated users can create own requests" on public.greenlife_hub;
create policy "Authenticated users can create own requests"
  on public.greenlife_hub
  for insert
  to authenticated
  with check (
    type = 'request'
    and user_id = auth.uid()
  );

drop policy if exists "Users can update own hub profile rows" on public.greenlife_hub;
create policy "Users can update own hub profile rows"
  on public.greenlife_hub
  for update
  to authenticated
  using (
    type = 'user_profile'
    and user_id = auth.uid()
  )
  with check (
    type = 'user_profile'
    and user_id = auth.uid()
  );

drop policy if exists "Admins can manage live chat conversations" on public.live_chat_conversations;
create policy "Admins can manage live chat conversations"
  on public.live_chat_conversations
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can manage live chat messages" on public.live_chat_messages;
create policy "Admins can manage live chat messages"
  on public.live_chat_messages
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
