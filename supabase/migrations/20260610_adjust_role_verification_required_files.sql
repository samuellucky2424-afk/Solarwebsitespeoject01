alter table if exists public.role_verification_requests
  alter column cac_document_url drop not null,
  alter column id_document_url drop not null;

alter table if exists public.role_verification_requests
  drop constraint if exists role_verification_required_files;

alter table if exists public.role_verification_requests
  add constraint role_verification_required_files check (
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
  );
