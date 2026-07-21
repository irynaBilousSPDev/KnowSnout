-- Shared product catalog keyed by barcode (extend later with more columns)

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text not null,
  product_name text not null,
  brand text,
  score integer not null check (score >= 0 and score <= 100),
  pros jsonb not null default '[]'::jsonb,
  cons jsonb not null default '[]'::jsonb,
  summary text not null default '',
  source text not null check (source in ('ai', 'open-pet-food-facts', 'open-food-facts', 'manual')),
  is_rich boolean not null default false,
  extras jsonb not null default '{}'::jsonb,
  scan_count integer not null default 1,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_barcode_unique unique (barcode)
);

create index if not exists products_barcode_idx on public.products (barcode);
create index if not exists products_is_rich_idx on public.products (is_rich);

alter table public.products enable row level security;

create policy "Authenticated users can read products"
  on public.products
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

-- Optional link from personal scan history to catalog + barcode
alter table public.scans
  add column if not exists barcode text,
  add column if not exists product_id uuid references public.products (id) on delete set null;

create index if not exists scans_barcode_idx on public.scans (barcode);
