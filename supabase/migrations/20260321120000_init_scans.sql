-- KnowSnout initial schema: scans table, RLS, storage bucket

create extension if not exists "pgcrypto";

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null,
  score integer not null check (score >= 0 and score <= 100),
  pros jsonb not null default '[]'::jsonb,
  cons jsonb not null default '[]'::jsonb,
  summary text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists scans_user_id_created_at_idx
  on public.scans (user_id, created_at desc);

alter table public.scans enable row level security;

create policy "Users can read own scans"
  on public.scans
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own scans"
  on public.scans
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', false)
on conflict (id) do nothing;

create policy "Users can upload own scan images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'scan-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own scan images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'scan-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own scan images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'scan-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
