-- Local-first forum UI (AsyncStorage). Run this when ready for cloud mirror.
-- App services stay local until explicitly wired; do not require this for demo.

create table if not exists public.forum_categories (
  id text primary key,
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.forum_categories (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  preview text not null default '',
  reply_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_threads_category_idx
  on public.forum_threads (category_id, created_at desc);

create index if not exists forum_threads_author_idx
  on public.forum_threads (author_id);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now()
);

create index if not exists forum_posts_thread_idx
  on public.forum_posts (thread_id, created_at);

create table if not exists public.forum_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  thread_id uuid references public.forum_threads (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists forum_notifications_user_idx
  on public.forum_notifications (user_id, created_at desc);

alter table public.forum_categories enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_notifications enable row level security;

drop policy if exists "Auth read forum categories" on public.forum_categories;
create policy "Auth read forum categories"
  on public.forum_categories for select to authenticated using (true);

drop policy if exists "Auth read forum threads" on public.forum_threads;
create policy "Auth read forum threads"
  on public.forum_threads for select to authenticated using (true);

drop policy if exists "Users insert own forum threads" on public.forum_threads;
create policy "Users insert own forum threads"
  on public.forum_threads for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Users update own forum threads" on public.forum_threads;
create policy "Users update own forum threads"
  on public.forum_threads for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Users delete own forum threads" on public.forum_threads;
create policy "Users delete own forum threads"
  on public.forum_threads for delete to authenticated
  using (auth.uid() = author_id);

drop policy if exists "Auth read forum posts" on public.forum_posts;
create policy "Auth read forum posts"
  on public.forum_posts for select to authenticated using (true);

drop policy if exists "Users insert own forum posts" on public.forum_posts;
create policy "Users insert own forum posts"
  on public.forum_posts for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Users delete own forum posts" on public.forum_posts;
create policy "Users delete own forum posts"
  on public.forum_posts for delete to authenticated
  using (auth.uid() = author_id);

drop policy if exists "Users read own forum notifications" on public.forum_notifications;
create policy "Users read own forum notifications"
  on public.forum_notifications for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own forum notifications" on public.forum_notifications;
create policy "Users update own forum notifications"
  on public.forum_notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users insert own forum notifications" on public.forum_notifications;
create policy "Users insert own forum notifications"
  on public.forum_notifications for insert to authenticated
  with check (auth.uid() = user_id);

comment on table public.forum_categories is
  'Forum categories; UI currently seeds locally — cloud optional.';
comment on table public.forum_threads is
  'Forum threads; local-first until service wired to Supabase.';
comment on table public.forum_posts is
  'Forum replies/posts.';
comment on table public.forum_notifications is
  'Per-user forum notifications (owner RLS).';
