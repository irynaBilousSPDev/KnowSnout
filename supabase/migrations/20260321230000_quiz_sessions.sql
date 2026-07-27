-- Quiz sessions per user: scores for average rating / history.
-- Informational game — not a veterinary assessment.

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null
    check (category in ('breed', 'breed_origin', 'animal_group')),
  species text
    check (species is null or species in ('dog', 'cat')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  percent numeric(5, 2) not null check (percent >= 0 and percent <= 100),
  created_at timestamptz not null default now()
);

create index if not exists quiz_sessions_user_id_idx
  on public.quiz_sessions (user_id);
create index if not exists quiz_sessions_user_created_idx
  on public.quiz_sessions (user_id, created_at desc);
create index if not exists quiz_sessions_category_idx
  on public.quiz_sessions (user_id, category);

alter table public.quiz_sessions enable row level security;

drop policy if exists "Users can read own quiz sessions" on public.quiz_sessions;
create policy "Users can read own quiz sessions"
  on public.quiz_sessions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own quiz sessions" on public.quiz_sessions;
create policy "Users can insert own quiz sessions"
  on public.quiz_sessions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own quiz sessions" on public.quiz_sessions;
create policy "Users can delete own quiz sessions"
  on public.quiz_sessions for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.quiz_sessions is
  'KnowSnout quiz rounds (breed photo / Wikidata). Used for per-user average rating.';
