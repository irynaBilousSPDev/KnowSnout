-- Species for history filters (dog / cat / unknown)

alter table public.products
  add column if not exists species text not null default 'unknown'
  check (species in ('dog', 'cat', 'unknown'));

alter table public.scans
  add column if not exists species text
  check (species is null or species in ('dog', 'cat', 'unknown'));

create index if not exists products_species_idx on public.products (species);
create index if not exists scans_species_idx on public.scans (species);
