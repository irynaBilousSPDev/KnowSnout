-- Richer pet profile fields for care, food matching, travel later

alter table public.pets
  add column if not exists color_coat text,
  add column if not exists coat_type text
    check (coat_type is null or coat_type in ('short', 'long', 'wire', 'curly', 'hairless', 'unknown')),
  add column if not exists size_category text
    check (size_category is null or size_category in ('toy', 'small', 'medium', 'large', 'giant', 'unknown')),
  add column if not exists sterilized boolean,
  add column if not exists allergies text,
  add column if not exists conditions text,
  add column if not exists medications text,
  add column if not exists activity_level text
    check (activity_level is null or activity_level in ('low', 'medium', 'high', 'unknown')),
  add column if not exists diet_type text
    check (diet_type is null or diet_type in ('dry', 'wet', 'mixed', 'raw', 'homemade', 'unknown')),
  add column if not exists indoor_outdoor text
    check (indoor_outdoor is null or indoor_outdoor in ('indoor', 'outdoor', 'both', 'unknown')),
  add column if not exists personality text,
  add column if not exists distinctive_marks text,
  add column if not exists acquired_date date,
  add column if not exists passport_number text,
  add column if not exists vet_name text,
  add column if not exists vet_phone text,
  add column if not exists ideal_weight_kg numeric(5, 2);

comment on column public.pets.allergies is 'Known allergies (food / environmental), free text for MVP';
comment on column public.pets.indoor_outdoor is 'Especially relevant for cats';
comment on column public.pets.passport_number is 'Pet passport / ID document number — private';
