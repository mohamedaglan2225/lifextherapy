-- Life X Therapy CMS — first milestone.
--
-- Security model
--   * Drafts and published content live in separate tables. Anonymous visitors
--     have no privileges at all on draft tables; RLS alone would hide rows, but
--     the grants are revoked too so a mistaken policy cannot expose drafts.
--   * Published tables are readable by everyone and writable by nobody through
--     the API. The only way to change them is the SECURITY DEFINER publish
--     functions below, which check `public.is_admin()` first.
--   * Admin membership is a row in `public.admins`, added by the project owner in
--     the SQL editor. Signing up through the API grants nothing.
--   * Draft images go to the private `cms-drafts` bucket and are copied to the
--     public `cms-public` bucket only when content using them is published.
--
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Admin membership
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins can read their own membership" on public.admins;
create policy "admins can read their own membership"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at / updated_by current on draft edits
-- ---------------------------------------------------------------------------

create or replace function public.cms_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Single-document content (home hero, contact details)
-- ---------------------------------------------------------------------------

create table if not exists public.content_drafts (
  key text primary key check (key in ('home_hero', 'contact')),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.content_published (
  key text primary key check (key in ('home_hero', 'contact')),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  version integer not null default 1,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null
);

-- Every publish is kept so a previous version can be restored later.
create table if not exists public.content_revisions (
  id bigint generated always as identity primary key,
  key text not null,
  data jsonb not null,
  version integer not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null
);

drop trigger if exists content_drafts_touch on public.content_drafts;
create trigger content_drafts_touch
  before insert or update on public.content_drafts
  for each row execute function public.cms_touch();

-- ---------------------------------------------------------------------------
-- Promotions
-- ---------------------------------------------------------------------------

create table if not exists public.promotion_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  image_path text check (
    image_path is null
    or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$'
  ),
  image_alt text not null default '' check (char_length(image_alt) <= 200),
  link_url text check (
    link_url is null
    or (
      char_length(link_url) <= 500
      and (link_url ~ '^https://[^[:space:]]+$' or (link_url ~ '^/([^/[:space:]][^[:space:]]*)?$' and position(E'\\' in link_url) = 0))
    )
  ),
  link_label text not null default '' check (char_length(link_label) <= 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.promotions_published (
  id uuid primary key references public.promotion_drafts (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  image_path text check (
    image_path is null
    or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$'
  ),
  image_alt text not null default '' check (char_length(image_alt) <= 200),
  link_url text check (
    link_url is null
    or (
      char_length(link_url) <= 500
      and (link_url ~ '^https://[^[:space:]]+$' or (link_url ~ '^/([^/[:space:]][^[:space:]]*)?$' and position(E'\\' in link_url) = 0))
    )
  ),
  link_label text not null default '' check (char_length(link_label) <= 40),
  sort_order integer not null default 0,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null
);

drop trigger if exists promotion_drafts_touch on public.promotion_drafts;
create trigger promotion_drafts_touch
  before insert or update on public.promotion_drafts
  for each row execute function public.cms_touch();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.content_drafts enable row level security;
alter table public.content_published enable row level security;
alter table public.content_revisions enable row level security;
alter table public.promotion_drafts enable row level security;
alter table public.promotions_published enable row level security;

drop policy if exists "admins manage content drafts" on public.content_drafts;
create policy "admins manage content drafts"
  on public.content_drafts for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "anyone reads published content" on public.content_published;
create policy "anyone reads published content"
  on public.content_published for select to anon, authenticated
  using (true);

drop policy if exists "admins read content revisions" on public.content_revisions;
create policy "admins read content revisions"
  on public.content_revisions for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins manage promotion drafts" on public.promotion_drafts;
create policy "admins manage promotion drafts"
  on public.promotion_drafts for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "anyone reads published promotions" on public.promotions_published;
create policy "anyone reads published promotions"
  on public.promotions_published for select to anon, authenticated
  using (true);

-- Belt and braces: Supabase grants table privileges to `anon` and
-- `authenticated` by default. Remove everything these roles never need so a
-- future policy mistake cannot widen access. TRUNCATE ignores RLS, so it goes too.
revoke all on public.admins, public.content_drafts, public.content_revisions, public.promotion_drafts
  from anon;
revoke insert, update, delete, truncate, references, trigger
  on public.admins, public.content_revisions, public.content_published, public.promotions_published
  from anon, authenticated;
revoke truncate, references, trigger
  on public.content_drafts, public.promotion_drafts
  from authenticated;
-- Visitors may read the content columns but not who published it (admin user ids).
revoke select on public.content_published, public.promotions_published from anon, authenticated;
grant select (key, data, version, published_at) on public.content_published to anon, authenticated;
grant select (id, title, description, image_path, image_alt, link_url, link_label, sort_order, published_at)
  on public.promotions_published to anon, authenticated;
grant select on public.admins, public.content_revisions to authenticated;
grant select, insert, update, delete on public.content_drafts, public.promotion_drafts to authenticated;

-- ---------------------------------------------------------------------------
-- Publishing (the only write path into published tables)
-- ---------------------------------------------------------------------------

create or replace function public.publish_content(p_key text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_data jsonb;
  v_version integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select d.data into v_data from public.content_drafts d where d.key = p_key;
  if v_data is null then
    raise exception 'nothing to publish for %', p_key using errcode = 'P0002';
  end if;

  insert into public.content_published as p (key, data, version, published_at, published_by)
  values (p_key, v_data, 1, now(), auth.uid())
  on conflict (key) do update
    set data = excluded.data,
        version = p.version + 1,
        published_at = now(),
        published_by = auth.uid()
  returning p.version into v_version;

  insert into public.content_revisions (key, data, version, published_by)
  values (p_key, v_data, v_version, auth.uid());

  return v_version;
end;
$$;

create or replace function public.publish_promotion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  insert into public.promotions_published as p
    (id, title, description, image_path, image_alt, link_url, link_label, sort_order, published_at, published_by)
  select d.id, d.title, d.description, d.image_path, d.image_alt, d.link_url, d.link_label, d.sort_order, now(), auth.uid()
  from public.promotion_drafts d
  where d.id = p_id
  on conflict (id) do update
    set title = excluded.title,
        description = excluded.description,
        image_path = excluded.image_path,
        image_alt = excluded.image_alt,
        link_url = excluded.link_url,
        link_label = excluded.link_label,
        sort_order = excluded.sort_order,
        published_at = now(),
        published_by = auth.uid();

  if not found then
    raise exception 'promotion % not found', p_id using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.unpublish_promotion(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  delete from public.promotions_published where id = p_id;
end;
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.publish_content(text) from public, anon;
revoke execute on function public.publish_promotion(uuid) from public, anon;
revoke execute on function public.unpublish_promotion(uuid) from public, anon;
revoke execute on function public.cms_touch() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.publish_content(text) to authenticated;
grant execute on function public.publish_promotion(uuid) to authenticated;
grant execute on function public.unpublish_promotion(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- 5 MB raster images only. SVG is excluded because it can carry script.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-drafts', 'cms-drafts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('cms-public', 'cms-public', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Object names are always `<uuid>.<ext>` at the bucket root. There are no
-- UPDATE policies: an uploaded file is never overwritten, only replaced by a
-- new name, which keeps cached public URLs correct.
drop policy if exists "cms: admins read draft media" on storage.objects;
create policy "cms: admins read draft media"
  on storage.objects for select to authenticated
  using (bucket_id = 'cms-drafts' and (select public.is_admin()));

drop policy if exists "cms: admins upload draft media" on storage.objects;
create policy "cms: admins upload draft media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cms-drafts'
    and (select public.is_admin())
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$'
  );

drop policy if exists "cms: admins delete draft media" on storage.objects;
create policy "cms: admins delete draft media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cms-drafts' and (select public.is_admin()));

drop policy if exists "cms: admins read public media" on storage.objects;
create policy "cms: admins read public media"
  on storage.objects for select to authenticated
  using (bucket_id = 'cms-public' and (select public.is_admin()));

drop policy if exists "cms: admins publish media" on storage.objects;
create policy "cms: admins publish media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cms-public'
    and (select public.is_admin())
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$'
  );

drop policy if exists "cms: admins delete public media" on storage.objects;
create policy "cms: admins delete public media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cms-public' and (select public.is_admin()));
