-- Favorite product link + feeding notes (ate all / short note)

alter table public.pets
  add column if not exists favorite_product_id uuid references public.products (id) on delete set null;

create index if not exists pets_favorite_product_id_idx
  on public.pets (favorite_product_id);

create table if not exists public.feeding_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  scan_id uuid references public.scans (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  ate_fully boolean,
  note text,
  fed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists feeding_logs_pet_id_idx on public.feeding_logs (pet_id);
create index if not exists feeding_logs_user_id_idx on public.feeding_logs (user_id);

alter table public.feeding_logs enable row level security;

create policy "Users can read own feeding logs"
  on public.feeding_logs for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own feeding logs"
  on public.feeding_logs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own feeding logs"
  on public.feeding_logs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own feeding logs"
  on public.feeding_logs for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.feeding_logs is
  'Optional meal notes: which pet ate which food, finished bowl or not.';
