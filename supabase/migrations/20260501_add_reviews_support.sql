-- Reviews & ratings stored in the existing greenlife_hub table with type='review'
-- Schema reuse:
--   user_id    = reviewer (auth.uid())
--   description= comment text
--   metadata   = { target_id, target_type ('product'|'package'|'gallery'), rating (1-5), customer_name, avatar }
--   created_at = automatic timestamp

-- Allow anyone (anon + authenticated) to read reviews
drop policy if exists "Public can read reviews" on public.greenlife_hub;
create policy "Public can read reviews"
  on public.greenlife_hub
  for select
  to anon, authenticated
  using (type = 'review');

-- Authenticated users can insert their own reviews
drop policy if exists "Users can insert own reviews" on public.greenlife_hub;
create policy "Users can insert own reviews"
  on public.greenlife_hub
  for insert
  to authenticated
  with check (
    type = 'review'
    and user_id = auth.uid()
  );

-- Users can update their own reviews
drop policy if exists "Users can update own reviews" on public.greenlife_hub;
create policy "Users can update own reviews"
  on public.greenlife_hub
  for update
  to authenticated
  using (type = 'review' and user_id = auth.uid())
  with check (type = 'review' and user_id = auth.uid());

-- Users can delete their own reviews
drop policy if exists "Users can delete own reviews" on public.greenlife_hub;
create policy "Users can delete own reviews"
  on public.greenlife_hub
  for delete
  to authenticated
  using (type = 'review' and user_id = auth.uid());

-- Index for faster lookup by target
create index if not exists idx_greenlife_hub_review_target
  on public.greenlife_hub ((metadata->>'target_id'))
  where type = 'review';
