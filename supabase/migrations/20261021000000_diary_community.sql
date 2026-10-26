-- GolpoFrame: Student Life Diary + Community
-- Safe clean setup for Supabase SQL Editor

begin;

-- Clean up any previous conflicting tables/views if they exist
drop view if exists public.public_stories cascade;
drop view if exists public.comment cascade;
drop view if exists public.share cascade;
drop table if exists public.comments cascade;
drop table if exists public.shares cascade;
drop table if exists public.likes cascade;
drop table if exists public.story_panels cascade;
drop table if exists public.story_characters cascade;
drop table if exists public.stories cascade;
drop table if exists public.profiles cascade;

-- ---------------------------------------------------------------- validators
create or replace function public.gf_characters_valid(p jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(p) <> 'array' then false
  else jsonb_array_length(p) <= 6 and not exists (
    select 1 from jsonb_array_elements(p) e
    where jsonb_typeof(e->'name') is distinct from 'string'
       or jsonb_typeof(e->'role') is distinct from 'string'
       or char_length(e->>'name') not between 1 and 60
       or char_length(e->>'role') > 80
  ) end
$$;

-- [] (incident-only note) or 4..8 well-formed panels
create or replace function public.gf_panels_valid(p jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(p) <> 'array' then false
  else jsonb_array_length(p) = 0 or (
    jsonb_array_length(p) between 4 and 8 and not exists (
      select 1 from jsonb_array_elements(p) e
      where jsonb_typeof(e->'scene') is distinct from 'string'
         or jsonb_typeof(e->'caption') is distinct from 'string'
         or jsonb_typeof(e->'speaker') is distinct from 'string'
         or jsonb_typeof(e->'dialogue') is distinct from 'string'
         or char_length(e->>'scene') not between 1 and 600
         or char_length(e->>'caption') > 240
         or char_length(e->>'speaker') not between 1 and 60
         or char_length(e->>'dialogue') not between 1 and 240
    )) end
$$;

-- ------------------------------------------------------------------ profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_len check (char_length(display_name) <= 60),
  constraint profiles_bio_len check (char_length(bio) <= 280)
);

create or replace function public.auto_confirm_user_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
  before insert on auth.users for each row execute function public.auto_confirm_user_email();

-- confirm any existing unconfirmed users automatically
update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email_confirmed_at is null;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(split_part(new.email, '@', 1), '')
  )
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- backfill users created before this migration (auth.users accounts stay 100% safe)
insert into public.profiles (id, username)
select id, 'user_' || substr(replace(id::text, '-', ''), 1, 10) from auth.users
on conflict do nothing;

alter table public.profiles enable row level security;

create policy profiles_read on public.profiles
  for select to anon, authenticated using (true);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (username, display_name, bio) on public.profiles to authenticated;

-- ------------------------------------------------------------------- stories
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  incident text not null default '',        -- ALWAYS private: not in public_stories
  summary text not null default '',
  punchline text not null default '',
  genre text not null,
  language text not null,
  source text not null default 'manual',
  engine text not null default '',
  characters jsonb not null default '[]'::jsonb,
  panels jsonb not null default '[]'::jsonb,
  visibility text not null default 'private',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_genre check (genre in ('action','romance','fantasy','scifi','horror','comedy')),
  constraint stories_language check (language in ('en','bn')),
  constraint stories_source check (source in ('template','ai','manual')),
  constraint stories_visibility check (visibility in ('private','public')),
  constraint stories_title_len check (char_length(title) between 1 and 120),
  constraint stories_incident_len check (char_length(incident) <= 1000),
  constraint stories_summary_len check (char_length(summary) <= 400),
  constraint stories_punchline_len check (char_length(punchline) <= 300),
  constraint stories_engine_len check (char_length(engine) <= 120),
  constraint stories_characters_ok check (public.gf_characters_valid(characters)),
  constraint stories_panels_ok check (public.gf_panels_valid(panels)),
  -- only complete comics can be public
  constraint stories_public_complete check (
    visibility = 'private' or (
      jsonb_array_length(panels) between 4 and 8
      and jsonb_array_length(characters) >= 1
      and char_length(summary) > 0
      and char_length(punchline) > 0)
  )
);

create index stories_owner_created_idx on public.stories (owner_id, created_at desc, id desc);
create index stories_public_idx on public.stories (published_at desc, id desc) where visibility = 'public';
create index stories_public_genre_idx on public.stories (genre, published_at desc) where visibility = 'public';

create or replace function public.stories_before_write() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.stories where owner_id = new.owner_id) >= 200 then
      raise exception 'diary_full';
    end if;
  end if;

  new.updated_at := now();

  if new.visibility = 'public' then
    if tg_op = 'UPDATE' and old.visibility = 'public' and old.published_at is not null then
      new.published_at := old.published_at;
    else
      new.published_at := now();
    end if;
  else
    new.published_at := null;
  end if;
  return new;
end $$;

drop trigger if exists stories_before_write on public.stories;
create trigger stories_before_write
  before insert or update on public.stories
  for each row execute function public.stories_before_write();

alter table public.stories enable row level security;

create policy stories_select_own on public.stories
  for select to authenticated using (owner_id = (select auth.uid()));
create policy stories_insert_own on public.stories
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy stories_update_own on public.stories
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy stories_delete_own on public.stories
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.stories from anon, authenticated;
grant select, delete on public.stories to authenticated;
grant insert (title, incident, summary, punchline, genre, language, source, engine, characters, panels, visibility)
  on public.stories to authenticated;
grant update (title, incident, summary, punchline, genre, language, source, engine, characters, panels, visibility)
  on public.stories to authenticated;

-- --------------------------------------------------------------------- likes
create table public.likes (
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);
create index likes_user_idx on public.likes (user_id);

alter table public.likes enable row level security;
create policy likes_select_own on public.likes
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.likes from anon, authenticated;
grant select on public.likes to authenticated;

create or replace function public.set_like(p_story_id uuid, p_liked boolean) returns integer
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cnt integer;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.stories where id = p_story_id and visibility = 'public') then
    raise exception 'story not found' using errcode = 'P0002';
  end if;
  if p_liked then
    insert into public.likes (story_id, user_id) values (p_story_id, uid) on conflict do nothing;
  else
    delete from public.likes where story_id = p_story_id and user_id = uid;
  end if;
  select count(*)::integer into cnt from public.likes where story_id = p_story_id;
  return cnt;
end $$;

revoke all on function public.set_like(uuid, boolean) from public, anon;
grant execute on function public.set_like(uuid, boolean) to authenticated;

-- ------------------------------------------------------------------ comments / comment
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_content_len check (char_length(trim(content)) between 1 and 500)
);
create index comments_story_created_idx on public.comments (story_id, created_at desc);
create index comments_user_idx on public.comments (user_id);

alter table public.comments enable row level security;

create policy comments_select_public on public.comments
  for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));
create policy comments_insert_own on public.comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public')
  );
create policy comments_delete_own on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.comments from anon, authenticated;
grant select on public.comments to anon, authenticated;
grant insert (story_id, content) on public.comments to authenticated;
grant delete on public.comments to authenticated;

-- Alias view `public.comment` so queries to either `comment` or `comments` work seamlessly
create view public.comment as select * from public.comments;
grant select on public.comment to anon, authenticated;
grant insert (story_id, content) on public.comment to authenticated;
grant delete on public.comment to authenticated;

-- -------------------------------------------------------------------- shares / share
create table public.shares (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  platform text not null default 'copy_link',
  created_at timestamptz not null default now(),
  constraint shares_platform_check check (
    platform in ('copy_link', 'facebook', 'whatsapp', 'twitter', 'diary_repost', 'native')
  )
);
create index shares_story_created_idx on public.shares (story_id, created_at desc);

alter table public.shares enable row level security;

create policy shares_select_public on public.shares
  for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));
create policy shares_insert_any on public.shares
  for insert to anon, authenticated
  with check (exists (select 1 from public.stories s where s.id = story_id and s.visibility = 'public'));

revoke all on public.shares from anon, authenticated;
grant select on public.shares to anon, authenticated;
grant insert (story_id, platform) on public.shares to anon, authenticated;

-- Alias view `public.share` so queries to either `share` or `shares` work seamlessly
create view public.share as select * from public.shares;
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

-- ---------------------------------------------------------------- public view
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

revoke all on public.public_stories from anon, authenticated;
grant select on public.public_stories to anon, authenticated;

commit;
