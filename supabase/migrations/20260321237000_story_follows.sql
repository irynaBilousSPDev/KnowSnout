-- Optional cloud follows for SnoutStories (scaffold).
-- App v1 uses AsyncStorage; run this when ready to sync follows across devices.

create table if not exists public.story_follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint story_follows_no_self check (follower_id <> following_id)
);

create index if not exists story_follows_following_idx
  on public.story_follows (following_id);

alter table public.story_follows enable row level security;

create policy "Users can read own follows"
  on public.story_follows for select to authenticated
  using (auth.uid() = follower_id);

create policy "Users can insert own follows"
  on public.story_follows for insert to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can delete own follows"
  on public.story_follows for delete to authenticated
  using (auth.uid() = follower_id);

comment on table public.story_follows is
  'Who follows whom in SnoutStories. Client may use local cache until synced.';
