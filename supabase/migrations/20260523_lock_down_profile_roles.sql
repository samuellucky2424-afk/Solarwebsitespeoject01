create or replace function public.current_actor_can_manage_roles()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.role(), '') = 'service_role'
    or public.is_admin_user();
$$;

grant execute on function public.current_actor_can_manage_roles() to anon, authenticated, service_role;

create or replace function public.protect_profile_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.role := coalesce(nullif(new.role, ''), 'user');

    if new.role <> 'user' and not public.current_actor_can_manage_roles() then
      raise exception 'Only admins can assign profile roles' using errcode = '42501';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if not public.current_actor_can_manage_roles() then
      raise exception 'Only admins can change profile roles' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_changes on public.profiles;
create trigger protect_profile_role_changes
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_role_changes();

