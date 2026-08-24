-- Pet vaccine log (calendar + next-due). Informational — not a veterinary prescription.
-- Idempotent: safe to re-run in SQL Editor if policies already exist.

create table if not exists public.pet_vaccines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  vaccine_key text,
  custom_name text,
  given_on date,
  next_due_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_vaccines_name_check check (
    vaccine_key is not null or (custom_name is not null and length(trim(custom_name)) > 0)
  )
);

create index if not exists pet_vaccines_pet_id_idx on public.pet_vaccines (pet_id);
create index if not exists pet_vaccines_next_due_idx on public.pet_vaccines (next_due_on);

alter table public.pet_vaccines enable row level security;

drop policy if exists "Users can read own pet vaccines" on public.pet_vaccines;
create policy "Users can read own pet vaccines"
  on public.pet_vaccines for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pet vaccines" on public.pet_vaccines;
create policy "Users can insert own pet vaccines"
  on public.pet_vaccines for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pet vaccines" on public.pet_vaccines;
create policy "Users can update own pet vaccines"
  on public.pet_vaccines for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pet vaccines" on public.pet_vaccines;
create policy "Users can delete own pet vaccines"
  on public.pet_vaccines for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.pet_vaccines is
  'Owner-logged vaccines per pet. Content is informational; verify with vet.';
