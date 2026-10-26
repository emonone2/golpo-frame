-- GolpoFrame: Add comment and share tables for community published stories
begin;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_content_len check (char_length(trim(content)) between 1 and 500)
);

create index if not exists comments_story_created_idx on public.comments (story_id, created_at desc);
create index if not exists comments_user_idx on public.comments (user_id);

alter table public.comments enable row level security;

drop policy if exists comments_select_public on public.comments;
create policy comments_select_public on public.comments
  for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));

drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own on public.comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public')
  );

drop policy if exists comments_delete_own on public.comments;
create policy comments_delete_own on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

grant select on public.comments to anon, authenticated;
grant insert (story_id, content) on public.comments to authenticated;
grant delete on public.comments to authenticated;

create or replace view public.comment as select * from public.comments;
grant select on public.comment to anon, authenticated;
grant insert (story_id, content) on public.comment to authenticated;
grant delete on public.comment to authenticated;

-- Share table
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  platform text not null default 'copy_link',
  created_at timestamptz not null default now(),
  constraint shares_platform_check check (
    platform in ('copy_link', 'facebook', 'whatsapp', 'twitter', 'diary_repost', 'native')
  )
);

create index if not exists shares_story_created_idx on public.shares (story_id, created_at desc);

alter table public.shares enable row level security;

drop policy if exists shares_select_public on public.shares;
create policy shares_select_public on public.shares
  for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));

drop policy if exists shares_insert_any on public.shares;
create policy shares_insert_any on public.shares
  for insert to anon, authenticated
  with check (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));

grant select on public.shares to anon, authenticated;
grant insert (story_id, platform) on public.shares to anon, authenticated;

create or replace view public.share as select * from public.shares;
grant select on public.share to anon, authenticated;
grant insert (story_id, platform) on public.share to anon, authenticated;

create or replace function public.record_share(p_story_id uuid, p_platform text default 'copy_link') returns integer
language plpgsql security definer set search_path = public as $$
declare
  cnt integer;
begin
  if not exists (select 1 from public.stories where id = p_story_id and visibility = 'public') then
    raise exception 'story not found' using errcode = 'P0002';
  end if;
  insert into public.shares (story_id, user_id, platform)
  values (p_story_id, auth.uid(), coalesce(p_platform, 'copy_link'));
  select count(*)::integer into cnt from public.shares where story_id = p_story_id;
  return cnt;
end $$;

grant execute on function public.record_share(uuid, text) to anon, authenticated;

drop view if exists public.public_stories;
create view public.public_stories as
select
  s.id,
  s.owner_id,
  p.username,
  p.display_name,
  s.title,
  s.summary,
  s.punchline,
  s.genre,
  s.language,
  s.source,
  s.engine,
  s.characters,
  s.panels,
  s.published_at,
  (select count(*) from public.likes l where l.story_id = s.id)::integer as like_count,
  (select count(*) from public.comments c where c.story_id = s.id)::integer as comment_count,
  (select count(*) from public.shares sh where sh.story_id = s.id)::integer as share_count
from public.stories s
join public.profiles p on p.id = s.owner_id
where s.visibility = 'public';

grant select on public.public_stories to anon, authenticated;

commit;
