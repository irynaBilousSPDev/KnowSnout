-- Plant safety cache: identify once, reuse toxicity for dog/cat.
-- Informational only — not a veterinary diagnosis.

create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  latin text not null,
  name_uk text not null,
  name_en text not null,
  name_pl text,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plants_latin_unique unique (latin)
);

create table if not exists public.plant_toxicity (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants (id) on delete cascade,
  species text not null check (species in ('dog', 'cat')),
  level text not null check (level in ('safe', 'mild', 'toxic', 'unknown')),
  notes text,
  created_at timestamptz not null default now(),
  constraint plant_toxicity_unique unique (plant_id, species)
);

create index if not exists plants_latin_idx on public.plants (latin);
create index if not exists plants_name_uk_idx on public.plants (name_uk);
create index if not exists plant_toxicity_plant_id_idx on public.plant_toxicity (plant_id);

create table if not exists public.plant_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  plant_id uuid references public.plants (id) on delete set null,
  query_text text,
  for_species text not null check (for_species in ('dog', 'cat')),
  level text not null check (level in ('safe', 'mild', 'toxic', 'unknown')),
  confidence numeric(4, 3),
  source text not null default 'search'
    check (source in ('search', 'photo', 'cache')),
  created_at timestamptz not null default now()
);

create index if not exists plant_checks_user_id_idx on public.plant_checks (user_id);
create index if not exists plant_checks_pet_id_idx on public.plant_checks (pet_id);

alter table public.plants enable row level security;
alter table public.plant_toxicity enable row level security;
alter table public.plant_checks enable row level security;

create policy "Authenticated can read plants"
  on public.plants for select to authenticated
  using (true);

create policy "Authenticated can read plant toxicity"
  on public.plant_toxicity for select to authenticated
  using (true);

create policy "Users can read own plant checks"
  on public.plant_checks for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own plant checks"
  on public.plant_checks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own plant checks"
  on public.plant_checks for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.plants is
  'Cached plant identities (Latin key). Informational plant-safety feature.';
comment on table public.plant_toxicity is
  'Toxicity level per companion species. Not a veterinary diagnosis.';
comment on table public.plant_checks is
  'Optional user history of plant safety lookups.';

-- Seed common houseplants (upsert by latin).
insert into public.plants (latin, name_uk, name_en, name_pl, aliases) values
  ('Lilium spp.', 'Лілія', 'True lily', 'Lilia', array['lily', 'лілії', 'easter lily']),
  ('Hemerocallis spp.', 'Лілійник', 'Daylily', 'Liliowiec', array['day lily', 'деньлілія']),
  ('Epipremnum aureum', 'Сциндапсус / потос', 'Pothos / devil''s ivy', 'Epipremnum złociste', array['pothos', 'devil ivy', 'золотий потос']),
  ('Monstera deliciosa', 'Монстера', 'Monstera / Swiss cheese plant', 'Monstera dziurawa', array['swiss cheese', 'монстера']),
  ('Philodendron spp.', 'Філодендрон', 'Philodendron', 'Filodendron', array['філодендрон']),
  ('Dieffenbachia spp.', 'Дифенбахія', 'Dieffenbachia / dumb cane', 'Difenbachia', array['dumb cane']),
  ('Spathiphyllum spp.', 'Спатифілум', 'Peace lily', 'Skrzydłokwiat', array['peace lily', 'спатіфілум']),
  ('Aloe vera', 'Алое', 'Aloe vera', 'Aloes', array['алоє', 'aloe']),
  ('Dracaena spp.', 'Драцена', 'Dracaena', 'Dracena', array['corn plant', 'драцена']),
  ('Dracaena trifasciata', 'Сансев''єрія', 'Snake plant', 'Sansewieria', array['sansevieria', 'snake plant', 'тещин язик']),
  ('Cycas revoluta', 'Сагова пальма', 'Sago palm', 'Sagowiec', array['cycad', 'саговник']),
  ('Nerium oleander', 'Олеандр', 'Oleander', 'Oleander', array['олеандер']),
  ('Rhododendron spp.', 'Азалія / рододендрон', 'Azalea / rhododendron', 'Azalia', array['azalea', 'азалія']),
  ('Tulipa spp.', 'Тюльпан', 'Tulip', 'Tulipan', array['тюльпани']),
  ('Narcissus spp.', 'Нарцис', 'Daffodil / narcissus', 'Narcyz', array['нарциси']),
  ('Chlorophytum comosum', 'Хлорофітум', 'Spider plant', 'Zielistka', array['spider plant', 'хлорофітум']),
  ('Goeppertia / Calathea spp.', 'Калатея', 'Calathea', 'Kalatea', array['calathea', 'калатея']),
  ('Maranta leuconeura', 'Маранта', 'Prayer plant', 'Maranta', array['prayer plant', 'маранта']),
  ('Nephrolepis exaltata', 'Бостонський папороть', 'Boston fern', 'Nephrolepis', array['boston fern', 'папороть']),
  ('Phalaenopsis spp.', 'Орхідея фаленопсис', 'Moth orchid', 'Storczyk Phalaenopsis', array['orchid', 'орхідея', 'фаленопсис']),
  ('Peperomia spp.', 'Пеперомія', 'Peperomia', 'Peperomia', array['peperomia']),
  ('Saintpaulia ionantha', 'Фіалка узамбарська', 'African violet', 'Fiołek afrykański', array['african violet', 'сенполія']),
  ('Pachira aquatica', 'Пахіра', 'Money tree', 'Pachira', array['money tree', 'пахіра']),
  ('Zamioculcas zamiifolia', 'Заміокулькас (ZZ)', 'ZZ plant', 'Zamiokulkas', array['zz plant', 'заміокулькас'])
on conflict (latin) do update set
  name_uk = excluded.name_uk,
  name_en = excluded.name_en,
  name_pl = excluded.name_pl,
  aliases = excluded.aliases,
  updated_at = now();

insert into public.plant_toxicity (plant_id, species, level, notes)
select p.id, v.species, v.level, v.notes
from public.plants p
join (
  values
    ('Lilium spp.', 'cat', 'toxic', 'Навіть пилок/вода з вази — небезпечні для нирок кота.'),
    ('Lilium spp.', 'dog', 'mild', 'Зазвичай ШКТ; для котів значно гірше.'),
    ('Hemerocallis spp.', 'cat', 'toxic', 'Токсична для котів (нирки).'),
    ('Hemerocallis spp.', 'dog', 'mild', 'Може викликати розлад ШКТ.'),
    ('Epipremnum aureum', 'cat', 'toxic', 'Оксалатні кристали — подразнення рота й блювання.'),
    ('Epipremnum aureum', 'dog', 'toxic', 'Оксалатні кристали — подразнення рота й блювання.'),
    ('Monstera deliciosa', 'cat', 'toxic', 'Оксалати кальцію — подразнення слизових.'),
    ('Monstera deliciosa', 'dog', 'toxic', 'Оксалати кальцію — подразнення слизових.'),
    ('Philodendron spp.', 'cat', 'toxic', 'Оксалати — біль у роті, слина.'),
    ('Philodendron spp.', 'dog', 'toxic', 'Оксалати — біль у роті, слина.'),
    ('Dieffenbachia spp.', 'cat', 'toxic', 'Сильне подразнення рота; можливий набряк.'),
    ('Dieffenbachia spp.', 'dog', 'toxic', 'Сильне подразнення рота; можливий набряк.'),
    ('Spathiphyllum spp.', 'cat', 'mild', 'Не справжня лілія; оксалати — легший ШКТ/рота.'),
    ('Spathiphyllum spp.', 'dog', 'mild', 'Не справжня лілія; оксалати — легший ШКТ/рота.'),
    ('Aloe vera', 'cat', 'toxic', 'Сапоніни — блювота, діарея.'),
    ('Aloe vera', 'dog', 'toxic', 'Сапоніни — блювота, діарея.'),
    ('Dracaena spp.', 'cat', 'toxic', 'Може викликати блювання, слабкість.'),
    ('Dracaena spp.', 'dog', 'toxic', 'Може викликати блювання, слабкість.'),
    ('Dracaena trifasciata', 'cat', 'mild', 'Сапоніни — нудота / розлад ШКТ.'),
    ('Dracaena trifasciata', 'dog', 'mild', 'Сапоніни — нудота / розлад ШКТ.'),
    ('Cycas revoluta', 'cat', 'toxic', 'Дуже небезпечна — печінка; терміново до вета.'),
    ('Cycas revoluta', 'dog', 'toxic', 'Дуже небезпечна — печінка; терміново до вета.'),
    ('Nerium oleander', 'cat', 'toxic', 'Кардіотоксична — усі частини рослини.'),
    ('Nerium oleander', 'dog', 'toxic', 'Кардіотоксична — усі частини рослини.'),
    ('Rhododendron spp.', 'cat', 'toxic', 'Граїнотоксини — ШКТ і серцево-судинні ризики.'),
    ('Rhododendron spp.', 'dog', 'toxic', 'Граїнотоксини — ШКТ і серцево-судинні ризики.'),
    ('Tulipa spp.', 'cat', 'toxic', 'Найбільш токсичні цибулини.'),
    ('Tulipa spp.', 'dog', 'toxic', 'Найбільш токсичні цибулини.'),
    ('Narcissus spp.', 'cat', 'toxic', 'Цибулини найнебезпечніші.'),
    ('Narcissus spp.', 'dog', 'toxic', 'Цибулини найнебезпечніші.'),
    ('Chlorophytum comosum', 'cat', 'safe', 'Зазвичай вважається безпечною.'),
    ('Chlorophytum comosum', 'dog', 'safe', 'Зазвичай вважається безпечною.'),
    ('Goeppertia / Calathea spp.', 'cat', 'safe', 'Зазвичай безпечна для котів.'),
    ('Goeppertia / Calathea spp.', 'dog', 'safe', 'Зазвичай безпечна для собак.'),
    ('Maranta leuconeura', 'cat', 'safe', 'Зазвичай безпечна.'),
    ('Maranta leuconeura', 'dog', 'safe', 'Зазвичай безпечна.'),
    ('Nephrolepis exaltata', 'cat', 'safe', 'Зазвичай безпечна.'),
    ('Nephrolepis exaltata', 'dog', 'safe', 'Зазвичай безпечна.'),
    ('Phalaenopsis spp.', 'cat', 'safe', 'Фаленопсис зазвичай безпечний.'),
    ('Phalaenopsis spp.', 'dog', 'safe', 'Фаленопсис зазвичай безпечний.'),
    ('Peperomia spp.', 'cat', 'safe', 'Зазвичай безпечна.'),
    ('Peperomia spp.', 'dog', 'safe', 'Зазвичай безпечна.'),
    ('Saintpaulia ionantha', 'cat', 'safe', 'Зазвичай безпечна.'),
    ('Saintpaulia ionantha', 'dog', 'safe', 'Зазвичай безпечна.'),
    ('Pachira aquatica', 'cat', 'safe', 'Зазвичай безпечна.'),
    ('Pachira aquatica', 'dog', 'safe', 'Зазвичай безпечна.'),
    ('Zamioculcas zamiifolia', 'cat', 'mild', 'Оксалати — подразнення при поїданні.'),
    ('Zamioculcas zamiifolia', 'dog', 'mild', 'Оксалати — подразнення при поїданні.')
) as v(latin, species, level, notes) on p.latin = v.latin
on conflict (plant_id, species) do update set
  level = excluded.level,
  notes = excluded.notes;
