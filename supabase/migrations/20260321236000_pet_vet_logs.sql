-- Meds / vet visit log per pet. Informational — not a veterinary prescription.

create table if not exists public.pet_vet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  entry_type text not null check (entry_type in ('meds', 'visit', 'note')),
  title text not null,
  logged_on date not null default (current_date),
  notes text,
  next_due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_vet_logs_title_check check (length(trim(title)) > 0)
);

create index if not exists pet_vet_logs_pet_id_idx on public.pet_vet_logs (pet_id);
create index if not exists pet_vet_logs_logged_on_idx on public.pet_vet_logs (logged_on desc);
create index if not exists pet_vet_logs_next_due_idx on public.pet_vet_logs (next_due_on);

alter table public.pet_vet_logs enable row level security;

create policy "Users can read own pet vet logs"
  on public.pet_vet_logs for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own pet vet logs"
  on public.pet_vet_logs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own pet vet logs"
  on public.pet_vet_logs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own pet vet logs"
  on public.pet_vet_logs for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.pet_vet_logs is
  'Owner-logged meds, vet visits, and notes. Informational; verify with vet.';
