-- Allow directories category «shops» (Магазини) for P1e «Де купити».
-- Local seed works without this; run in Supabase before inserting shop rows.

alter table public.directory_places
  drop constraint if exists directory_places_category_check;

alter table public.directory_places
  add constraint directory_places_category_check
  check (
    category in (
      'vets',
      'breeders',
      'transport',
      'sitters',
      'insurance',
      'lodging',
      'shops'
    )
  );

comment on column public.directory_places.category is
  'vets | breeders | transport | sitters | insurance | lodging | shops';
