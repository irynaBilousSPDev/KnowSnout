-- SnoutStories feed fields + readable story images for all auth users.
-- Run after 20260321200000_snout_stories.sql

alter table public.story_posts
  add column if not exists privacy text not null default 'public',
  add column if not exists species text,
  add column if not exists author_name text,
  add column if not exists pet_name text,
  add column if not exists avatar_key text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'story_posts_privacy_check'
  ) then
    alter table public.story_posts
      add constraint story_posts_privacy_check
      check (privacy in ('public', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'story_posts_species_check'
  ) then
    alter table public.story_posts
      add constraint story_posts_species_check
      check (species is null or species in ('dog', 'cat'));
  end if;
end $$;

drop policy if exists "Auth can read story posts" on public.story_posts;
create policy "Auth can read story posts"
  on public.story_posts for select to authenticated
  using (privacy = 'public' or auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('story-images', 'story-images', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload own story images" on storage.objects;
create policy "Users can upload own story images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'story-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Auth can read story images" on storage.objects;
create policy "Auth can read story images"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'story-images');

drop policy if exists "Users can delete own story images" on storage.objects;
create policy "Users can delete own story images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'story-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

comment on column public.story_posts.privacy is
  'public = feed; private = only author (Мої)';
comment on column public.story_posts.author_name is
  'Denormalized display name at publish time (no profiles table yet)';
