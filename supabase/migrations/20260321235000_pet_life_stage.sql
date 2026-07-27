-- Life stage for food matching (puppy/kitten/adult/senior).
alter table public.pets
  add column if not exists life_stage text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pets_life_stage_check'
  ) then
    alter table public.pets
      add constraint pets_life_stage_check
      check (
        life_stage is null
        or life_stage in ('puppy', 'kitten', 'adult', 'senior', 'unknown')
      );
  end if;
end $$;

comment on column public.pets.life_stage is
  'Life stage for informational food match (not a veterinary diet plan)';
