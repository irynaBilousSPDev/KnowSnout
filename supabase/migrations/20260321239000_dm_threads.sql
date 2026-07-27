-- Lightweight DMs for SnoutStories (participants only).
-- App keeps a local AsyncStorage cache; cloud when both users are real auth UUIDs.

create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dm_threads_ordered check (user_a < user_b),
  constraint dm_threads_pair unique (user_a, user_b)
);

create index if not exists dm_threads_user_a_idx on public.dm_threads (user_a);
create index if not exists dm_threads_user_b_idx on public.dm_threads (user_b);

alter table public.dm_threads enable row level security;

create policy "Participants can read dm threads"
  on public.dm_threads for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Participants can insert dm threads"
  on public.dm_threads for insert to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "Participants can update dm threads"
  on public.dm_threads for update to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists dm_messages_thread_idx
  on public.dm_messages (thread_id, created_at);

alter table public.dm_messages enable row level security;

create policy "Participants can read dm messages"
  on public.dm_messages for select to authenticated
  using (
    exists (
      select 1
      from public.dm_threads t
      where t.id = thread_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

create policy "Participants can insert dm messages"
  on public.dm_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.dm_threads t
      where t.id = thread_id
        and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

comment on table public.dm_threads is '1:1 DM threads; user_a < user_b';
comment on table public.dm_messages is 'Text-only DM messages for SnoutStories';
