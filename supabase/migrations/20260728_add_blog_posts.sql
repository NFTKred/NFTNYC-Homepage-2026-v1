-- Blog posts stored as structured, block-based rows.
--
-- One row per post. Content is a JSONB ordered array of typed blocks
-- (see src/data/blog/types.ts for the discriminated union). Public
-- rendering happens through /blog/:slug and /blog. Draft rows are
-- only readable by authenticated admin users.

create table if not exists public.blog_posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  status         text not null default 'draft',
  title          text not null,
  subtitle       text,
  description    text,
  author         text,
  tag            text,
  hero_image_url text,
  hero_image_alt text,
  og_image_url   text,
  read_minutes   int,
  content        jsonb not null default '[]'::jsonb,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint blog_posts_status_check check (status in ('draft', 'scheduled', 'published'))
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts(status, published_at desc);

-- keep updated_at fresh
create or replace function public.touch_blog_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_blog_posts_updated_at();

-- RLS: anyone can read published posts. Only authenticated users
-- (admins, enforced via ProtectedRoute + auth.uid()) can write and
-- read drafts.
alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts read published" on public.blog_posts;
create policy "blog_posts read published"
  on public.blog_posts
  for select
  using (status = 'published');

drop policy if exists "blog_posts admin all" on public.blog_posts;
create policy "blog_posts admin all"
  on public.blog_posts
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Storage bucket for post hero images, in-content images, OG images,
-- and any other media referenced by a block.
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "blog media public read" on storage.objects;
create policy "blog media public read"
  on storage.objects
  for select
  using (bucket_id = 'blog-media');

drop policy if exists "blog media admin write" on storage.objects;
create policy "blog media admin write"
  on storage.objects
  for insert
  with check (bucket_id = 'blog-media' and auth.uid() is not null);

drop policy if exists "blog media admin update" on storage.objects;
create policy "blog media admin update"
  on storage.objects
  for update
  using (bucket_id = 'blog-media' and auth.uid() is not null);

drop policy if exists "blog media admin delete" on storage.objects;
create policy "blog media admin delete"
  on storage.objects
  for delete
  using (bucket_id = 'blog-media' and auth.uid() is not null);
