-- Tighten blog RLS to admin-only writes.
--
-- 20260728_add_blog_posts.sql shipped with policies gated on
-- `auth.uid() is not null`, i.e. ANY authenticated user could write
-- blog_posts and blog-media objects (and read drafts). Because
-- signups were open at the time, that included non-team accounts.
-- This migration re-gates everything on is_admin() - membership in
-- admin_users - matching how resources/speakers are protected.
-- Public read of published posts and blog-media objects is unchanged.

-- Ensure the full internal team is in admin_users.
insert into public.admin_users (email) values
  ('ljjohnson@nft.nyc'),
  ('team@nft.nyc')
on conflict (email) do nothing;

-- blog_posts: replace the any-authenticated policy (covers draft
-- reads and all writes).
drop policy if exists "blog_posts admin all" on public.blog_posts;
create policy "blog_posts admin all"
  on public.blog_posts
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- blog-media storage: replace the any-authenticated write policies.
drop policy if exists "blog media admin write" on storage.objects;
create policy "blog media admin write"
  on storage.objects
  for insert
  with check (bucket_id = 'blog-media' and public.is_admin());

drop policy if exists "blog media admin update" on storage.objects;
create policy "blog media admin update"
  on storage.objects
  for update
  using (bucket_id = 'blog-media' and public.is_admin());

drop policy if exists "blog media admin delete" on storage.objects;
create policy "blog media admin delete"
  on storage.objects
  for delete
  using (bucket_id = 'blog-media' and public.is_admin());
