-- Friends graph cloud scaffold. UI/services stay AsyncStorage-local until wired.
-- Run when ready to mirror friendships / invites to Supabase.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_ordered check (user_a < user_b),
  constraint friendships_pair unique (user_a, user_b)
);

create index if not exists friendships_user_a_idx on public.friendships (user_a);
create index if not exists friendships_user_b_idx on public.friendships (user_b);

create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  accepted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists friend_invites_created_by_idx
  on public.friend_invites (created_by, created_at desc);

create index if not exists friend_invites_token_idx
  on public.friend_invites (token);

alter table public.friendships enable row level security;
alter table public.friend_invites enable row level security;

drop policy if exists "Participants read friendships" on public.friendships;
create policy "Participants read friendships"
  on public.friendships for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Participants insert friendships" on public.friendships;
create policy "Participants insert friendships"
  on public.friendships for insert to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Participants delete friendships" on public.friendships;
create policy "Participants delete friendships"
  on public.friendships for delete to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users read own friend invites" on public.friend_invites;
create policy "Users read own friend invites"
  on public.friend_invites for select to authenticated
  using (auth.uid() = created_by or auth.uid() = accepted_by);

drop policy if exists "Users insert own friend invites" on public.friend_invites;
create policy "Users insert own friend invites"
  on public.friend_invites for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Users update friend invites" on public.friend_invites;
create policy "Users update friend invites"
  on public.friend_invites for update to authenticated
  using (auth.uid() = created_by or auth.uid() = accepted_by)
  with check (auth.uid() = created_by or auth.uid() = accepted_by);

comment on table public.friendships is
  'Accepted friend pairs; user_a < user_b. Local-first until wired.';
comment on table public.friend_invites is
  'Shareable invite tokens for friends graph.';
