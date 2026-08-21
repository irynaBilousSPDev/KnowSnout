-- Spotlight contests cloud scaffold. UI stays local AsyncStorage until wired.
-- Run when ready to mirror contests / entries / votes.

create table if not exists public.spotlight_contests (
  id text primary key,
  title text not null,
  brief text not null default '',
  status text not null default 'active'
    check (status in ('active', 'closed')),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.spotlight_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id text not null references public.spotlight_contests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_name text not null,
  caption text not null default '',
  author_name text not null default '',
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists spotlight_entries_contest_idx
  on public.spotlight_entries (contest_id, vote_count desc);

create index if not exists spotlight_entries_user_idx
  on public.spotlight_entries (user_id);

create table if not exists public.spotlight_votes (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.spotlight_entries (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  device_id text,
  created_at timestamptz not null default now(),
  constraint spotlight_votes_identity check (
    user_id is not null or (device_id is not null and char_length(device_id) > 0)
  )
);

create unique index if not exists spotlight_votes_user_entry_uidx
  on public.spotlight_votes (entry_id, user_id)
  where user_id is not null;

create unique index if not exists spotlight_votes_device_entry_uidx
  on public.spotlight_votes (entry_id, device_id)
  where device_id is not null;

create index if not exists spotlight_votes_entry_idx
  on public.spotlight_votes (entry_id);

alter table public.spotlight_contests enable row level security;
alter table public.spotlight_entries enable row level security;
alter table public.spotlight_votes enable row level security;

drop policy if exists "Auth read spotlight contests" on public.spotlight_contests;
create policy "Auth read spotlight contests"
  on public.spotlight_contests for select to authenticated using (true);

drop policy if exists "Auth read spotlight entries" on public.spotlight_entries;
create policy "Auth read spotlight entries"
  on public.spotlight_entries for select to authenticated using (true);

drop policy if exists "Users insert own spotlight entries" on public.spotlight_entries;
create policy "Users insert own spotlight entries"
  on public.spotlight_entries for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own spotlight entries" on public.spotlight_entries;
create policy "Users update own spotlight entries"
  on public.spotlight_entries for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own spotlight entries" on public.spotlight_entries;
create policy "Users delete own spotlight entries"
  on public.spotlight_entries for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Auth read spotlight votes" on public.spotlight_votes;
create policy "Auth read spotlight votes"
  on public.spotlight_votes for select to authenticated using (true);

drop policy if exists "Users insert own spotlight votes" on public.spotlight_votes;
create policy "Users insert own spotlight votes"
  on public.spotlight_votes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own spotlight votes" on public.spotlight_votes;
create policy "Users delete own spotlight votes"
  on public.spotlight_votes for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.spotlight_contests is
  'Spotlight contests; local seed until cloud live.';
comment on table public.spotlight_entries is
  'User contest entries with denormalized vote_count.';
comment on table public.spotlight_votes is
  'One vote per auth user (or device guest) per entry.';
