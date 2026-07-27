-- Optional cloud moderation tables (scaffold).
-- App v1 stores blocks/reports in AsyncStorage.

create table if not exists public.story_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint story_blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists story_blocks_blocked_idx
  on public.story_blocks (blocked_id);

alter table public.story_blocks enable row level security;

create policy "Users can read own blocks"
  on public.story_blocks for select to authenticated
  using (auth.uid() = blocker_id);

create policy "Users can insert own blocks"
  on public.story_blocks for insert to authenticated
  with check (auth.uid() = blocker_id);

create policy "Users can delete own blocks"
  on public.story_blocks for delete to authenticated
  using (auth.uid() = blocker_id);

create table if not exists public.story_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid references public.story_posts (id) on delete set null,
  reason text not null check (
    reason in ('spam', 'abuse', 'inappropriate', 'other')
  ),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists story_reports_reporter_idx
  on public.story_reports (reporter_id);

alter table public.story_reports enable row level security;

create policy "Users can insert own reports"
  on public.story_reports for insert to authenticated
  with check (auth.uid() = reporter_id);

create policy "Users can read own reports"
  on public.story_reports for select to authenticated
  using (auth.uid() = reporter_id);

comment on table public.story_blocks is
  'User blocks for SnoutStories feed filtering';
comment on table public.story_reports is
  'User-submitted reports; review queue is ops/later';
