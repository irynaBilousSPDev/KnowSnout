-- Denormalized author on comments (no public profiles table yet).
alter table public.story_comments
  add column if not exists author_name text;

comment on column public.story_comments.author_name is
  'Display name at comment time';
