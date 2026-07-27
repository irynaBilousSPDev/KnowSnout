-- Allow Open Trivia DB animals category in quiz_sessions.

alter table public.quiz_sessions
  drop constraint if exists quiz_sessions_category_check;

alter table public.quiz_sessions
  add constraint quiz_sessions_category_check
  check (
    category in (
      'breed',
      'breed_origin',
      'animal_group',
      'animals_trivia'
    )
  );
