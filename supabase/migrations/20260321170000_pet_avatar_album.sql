-- Pet avatars, favorite food, album photos

alter table public.pets
  add column if not exists avatar_key text,
  add column if not exists avatar_path text,
  add column if not exists favorite_food text,
  add column if not exists origin text not null default 'home'
    check (origin in ('home', 'shelter'));

comment on column public.pets.avatar_key is
  'Built-in cartoon avatar id, e.g. dog-1, cat-2. Null if custom photo.';
comment on column public.pets.avatar_path is
  'Storage path for custom avatar photo. Private to owner.';
comment on column public.pets.origin is
  'home = family pet; shelter = came from shelter (details in extras.shelter).';

create table if not exists public.pet_photos (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text,
  local_uri text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pet_photos_pet_id_idx on public.pet_photos (pet_id);

alter table public.pet_photos enable row level security;

create policy "Users can read own pet photos"
  on public.pet_photos for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own pet photos"
  on public.pet_photos for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own pet photos"
  on public.pet_photos for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own pet photos"
  on public.pet_photos for delete to authenticated
  using (auth.uid() = user_id);
