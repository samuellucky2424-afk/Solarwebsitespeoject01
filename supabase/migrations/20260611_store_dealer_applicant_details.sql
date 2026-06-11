alter table if exists public.role_verification_requests
  add column if not exists applicant_full_name text,
  add column if not exists applicant_email text,
  add column if not exists applicant_phone text,
  add column if not exists applicant_address text,
  add column if not exists applicant_metadata jsonb not null default '{}'::jsonb;

update public.profiles as profile
set
  full_name = coalesce(nullif(profile.full_name, ''), nullif(auth_user.raw_user_meta_data->>'full_name', '')),
  email = coalesce(nullif(profile.email, ''), auth_user.email, nullif(auth_user.raw_user_meta_data->>'email', '')),
  phone = coalesce(nullif(profile.phone, ''), nullif(auth_user.raw_user_meta_data->>'phone', '')),
  address = coalesce(nullif(profile.address, ''), nullif(auth_user.raw_user_meta_data->>'address', '')),
  metadata = coalesce(profile.metadata, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
    'full_name', coalesce(nullif(profile.full_name, ''), nullif(auth_user.raw_user_meta_data->>'full_name', '')),
    'email', coalesce(nullif(profile.email, ''), auth_user.email, nullif(auth_user.raw_user_meta_data->>'email', '')),
    'phone', coalesce(nullif(profile.phone, ''), nullif(auth_user.raw_user_meta_data->>'phone', '')),
    'address', coalesce(nullif(profile.address, ''), nullif(auth_user.raw_user_meta_data->>'address', ''))
  ))
from auth.users as auth_user
where profile.id = auth_user.id
  and exists (
    select 1
    from public.role_verification_requests request
    where request.user_id = profile.id
  );

update public.role_verification_requests as request
set
  applicant_full_name = coalesce(
    nullif(request.applicant_full_name, ''),
    nullif(profile.full_name, ''),
    nullif(auth_user.raw_user_meta_data->>'full_name', '')
  ),
  applicant_email = coalesce(
    nullif(request.applicant_email, ''),
    nullif(profile.email, ''),
    auth_user.email,
    nullif(auth_user.raw_user_meta_data->>'email', '')
  ),
  applicant_phone = coalesce(
    nullif(request.applicant_phone, ''),
    nullif(profile.phone, ''),
    nullif(auth_user.raw_user_meta_data->>'phone', '')
  ),
  applicant_address = coalesce(
    nullif(request.applicant_address, ''),
    nullif(profile.address, ''),
    nullif(auth_user.raw_user_meta_data->>'address', '')
  ),
  applicant_metadata = coalesce(request.applicant_metadata, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
    'full_name', coalesce(nullif(profile.full_name, ''), nullif(auth_user.raw_user_meta_data->>'full_name', '')),
    'email', coalesce(nullif(profile.email, ''), auth_user.email, nullif(auth_user.raw_user_meta_data->>'email', '')),
    'phone', coalesce(nullif(profile.phone, ''), nullif(auth_user.raw_user_meta_data->>'phone', '')),
    'address', coalesce(nullif(profile.address, ''), nullif(auth_user.raw_user_meta_data->>'address', ''))
  ))
from auth.users as auth_user
left join public.profiles as profile on profile.id = auth_user.id
where request.user_id = auth_user.id;
