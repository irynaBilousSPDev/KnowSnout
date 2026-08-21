-- Directories trust layer (places / reviews / fraud reports).
-- App catalog + reviews stay local seed/AsyncStorage; run SQL when going live.

create table if not exists public.directory_places (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in (
      'vets',
      'breeders',
      'transport',
      'sitters',
      'insurance',
      'lodging'
    )
  ),
  name text not null,
  city text not null,
  specialty text,
  verification text not null default 'unverified'
    check (verification in ('verified', 'pending', 'unverified')),
  rating numeric(3, 2) not null default 0,
  review_count int not null default 0,
  phone text,
  blurb text not null default '',
  routes text[] not null default '{}',
  vehicle_type text,
  reviews_blurb text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists directory_places_category_city_idx
  on public.directory_places (category, city);

create table if not exists public.directory_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.directory_places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists directory_reviews_place_idx
  on public.directory_reviews (place_id, created_at desc);

create table if not exists public.directory_fraud_reports (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.directory_places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 200),
  details text not null default '',
  status text not null default 'queued'
    check (status in ('queued', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists directory_fraud_reports_place_idx
  on public.directory_fraud_reports (place_id, created_at desc);

alter table public.directory_places enable row level security;
alter table public.directory_reviews enable row level security;
alter table public.directory_fraud_reports enable row level security;

drop policy if exists "Auth read directory places" on public.directory_places;
create policy "Auth read directory places"
  on public.directory_places for select to authenticated using (true);

drop policy if exists "Users insert directory places" on public.directory_places;
create policy "Users insert directory places"
  on public.directory_places for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Users update own directory places" on public.directory_places;
create policy "Users update own directory places"
  on public.directory_places for update to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Auth read directory reviews" on public.directory_reviews;
create policy "Auth read directory reviews"
  on public.directory_reviews for select to authenticated using (true);

drop policy if exists "Users insert own directory reviews" on public.directory_reviews;
create policy "Users insert own directory reviews"
  on public.directory_reviews for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own directory reviews" on public.directory_reviews;
create policy "Users delete own directory reviews"
  on public.directory_reviews for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users read own fraud reports" on public.directory_fraud_reports;
create policy "Users read own fraud reports"
  on public.directory_fraud_reports for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own fraud reports" on public.directory_fraud_reports;
create policy "Users insert own fraud reports"
  on public.directory_fraud_reports for insert to authenticated
  with check (auth.uid() = user_id);

comment on table public.directory_places is
  'Directory establishments; local seed until cloud catalog live.';
comment on table public.directory_reviews is
  'User reviews for directory places.';
comment on table public.directory_fraud_reports is
  'Fraud / trust reports queue (owner read/write).';
