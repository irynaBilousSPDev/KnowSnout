-- Seed + vote helper for Spotlight/Forum cloud wiring.
-- Run after 240000–243000.

insert into public.forum_categories (id, title, body, sort_order)
values
  ('fc-care', 'Догляд', 'Гігієна, шерсть, кігті, вуха', 1),
  ('fc-food', 'Харчування', 'Корми, переходи, алергії (досвід)', 2),
  ('fc-train', 'Виховання', 'Прогулянки, команди, поведінка', 3),
  ('fc-offtopic', 'Офтоп', 'Мемчики й знайомства власників', 4)
on conflict (id) do update
  set title = excluded.title,
      body = excluded.body,
      sort_order = excluded.sort_order;

insert into public.spotlight_contests (id, title, brief, status, ends_at)
values
  (
    'sp-sunny',
    'Сонячна мордочка',
    'Світло, вікно, прогулянка — лови момент, коли улюбленець сяє.',
    'active',
    '2026-12-31T21:00:00Z'
  ),
  (
    'sp-play',
    'Гра тижня',
    'Іграшка, стрибок, «полювання» — покажи, як ви граєте разом.',
    'active',
    '2026-12-31T21:00:00Z'
  )
on conflict (id) do update
  set title = excluded.title,
      brief = excluded.brief,
      status = excluded.status,
      ends_at = excluded.ends_at;

-- One vote per auth user; bumps vote_count when newly inserted.
create or replace function public.cast_spotlight_vote(p_entry_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  inserted int;
begin
  if uid is null then
    return false;
  end if;

  insert into public.spotlight_votes (entry_id, user_id)
  values (p_entry_id, uid)
  on conflict do nothing;

  get diagnostics inserted = row_count;
  if inserted > 0 then
    update public.spotlight_entries
      set vote_count = vote_count + 1
      where id = p_entry_id;
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.cast_spotlight_vote(uuid) from public;
grant execute on function public.cast_spotlight_vote(uuid) to authenticated;

insert into public.directory_places (
  id, category, name, city, specialty, verification, rating, review_count, phone, blurb,
  routes, vehicle_type, reviews_blurb
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'vets',
    'Клініка «Лапка» Cloud',
    'Київ',
    'Загальна практика',
    'verified',
    4.8,
    12,
    '+380441112233',
    'Хмарний запис довідника (після міграції).',
    '{}',
    null,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'transport',
    'PetRide Cloud',
    'Київ',
    null,
    'verified',
    4.3,
    5,
    null,
    'Перевізник з cloud seed.',
    array['Київ–Варшава', 'Київ–Львів'],
    'бус з клітками',
    'Спокійні відгуки в демо.'
  )
on conflict (id) do nothing;
