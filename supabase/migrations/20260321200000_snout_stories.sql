-- SnoutStories social feed (pets & moments — not food reviews)
-- Enable when ready to ship backend; UI tab already uses demo posts.

create table if not exists public.story_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  caption text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_posts_created_at_idx
  on public.story_posts (created_at desc);

create table if not exists public.story_likes (
  post_id uuid not null references public.story_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.story_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.story_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists story_comments_post_id_idx
  on public.story_comments (post_id);

alter table public.story_posts enable row level security;
alter table public.story_likes enable row level security;
alter table public.story_comments enable row level security;

-- Open read for authenticated feed; write own rows only (tighten later with follows)
create policy "Auth can read story posts"
  on public.story_posts for select to authenticated using (true);

create policy "Users insert own story posts"
  on public.story_posts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own story posts"
  on public.story_posts for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own story posts"
  on public.story_posts for delete to authenticated
  using (auth.uid() = user_id);

create policy "Auth can read story likes"
  on public.story_likes for select to authenticated using (true);

create policy "Users insert own likes"
  on public.story_likes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own likes"
  on public.story_likes for delete to authenticated
  using (auth.uid() = user_id);

create policy "Auth can read story comments"
  on public.story_comments for select to authenticated using (true);

create policy "Users insert own comments"
  on public.story_comments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own comments"
  on public.story_comments for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.story_posts is
  'SnoutStories: share pets and moments. Hearts + comments in related tables.';
