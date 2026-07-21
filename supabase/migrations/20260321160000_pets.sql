-- Pet profiles (foundation for vaccines, travel docs, toys matching)

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'other')),
  breed text,
  sex text check (sex is null or sex in ('female', 'male', 'unknown')),
  birth_date date,
  weight_kg numeric(5, 2),
  chip_code text,
  notes text,
  extras jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_user_id_idx on public.pets (user_id);

alter table public.pets enable row level security;

create policy "Users can read own pets"
  on public.pets for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own pets"
  on public.pets for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own pets"
  on public.pets for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own pets"
  on public.pets for delete to authenticated
  using (auth.uid() = user_id);

comment on column public.pets.chip_code is
  'Private owner reference only. Never expose in public search.';
