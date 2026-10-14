-- Life X Therapy CMS — full content model.
--
-- Run after 20261014000000_cms_mvp.sql (which created admins, is_admin() and
-- the two storage buckets). Safe on a fresh project and on a project where the
-- MVP was already applied; the MVP tables stay in place but are no longer used.
-- `supabase/seed.sql` copies any MVP edits into the new documents.
--
-- Security model
--   * Content is stored as documents identified by (kind, key).
--   * Drafts (cms_drafts) and published content (cms_published) are separate
--     tables. Anonymous visitors can read published content columns only; they
--     have no privileges on drafts, revisions or media at all.
--   * Nobody writes these tables directly. Every change goes through a
--     SECURITY DEFINER function that first checks public.is_admin(), so the
--     API cannot be used to bypass validation, version checks or history.
--   * Publishing is one transaction: version check, image check, published
--     row, revision and media bookkeeping succeed or fail together.
--   * Saves carry the version the editor started from; a stale version is
--     rejected (SQLSTATE 40001) so one editor never silently overwrites another.
--
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.cms_valid_key(p_kind text, p_key text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_kind
    when 'settings' then p_key = 'site'
    when 'page' then p_key in ('home', 'about', 'services', 'contact', 'faq', 'privacy', 'terms', 'service')
    when 'faqs' then p_key = 'all'
    when 'service' then p_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    when 'promotion' then p_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    else false
  end;
$$;

-- Every uploaded file name (`<uuid>.<ext>`) referenced anywhere in a document.
create or replace function public.cms_image_paths(p_data jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(distinct m[1]), '{}')
  from regexp_matches(p_data::text, '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|avif))', 'g') as m;
$$;

create or replace function public.cms_assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.cms_drafts (
  kind text not null,
  key text not null,
  data jsonb not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  updated_by_email text,
  primary key (kind, key),
  constraint cms_drafts_valid_key check (public.cms_valid_key(kind, key)),
  constraint cms_drafts_data_object check (jsonb_typeof(data) = 'object'),
  constraint cms_drafts_data_size check (pg_column_size(data) < 524288)
);

create table if not exists public.cms_published (
  kind text not null,
  key text not null,
  data jsonb not null,
  -- The draft version that was published.
  version integer not null default 0,
  published_at timestamptz not null default now(),
  primary key (kind, key),
  foreign key (kind, key) references public.cms_drafts (kind, key) on delete cascade,
  constraint cms_published_data_object check (jsonb_typeof(data) = 'object')
);

create table if not exists public.cms_revisions (
  id bigint generated always as identity primary key,
  kind text not null,
  key text not null,
  data jsonb not null,
  version integer not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null,
  published_by_email text
);
create index if not exists cms_revisions_doc on public.cms_revisions (kind, key, published_at desc);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique
    check (path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$'),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  width integer check (width is null or width between 1 and 20000),
  height integer check (height is null or height between 1 and 20000),
  alt text not null default '' check (char_length(alt) <= 200),
  original_name text not null default '' check (char_length(original_name) <= 200),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  -- When the file was copied to the public bucket; null while it is private.
  public_at timestamptz
);

-- Service addresses must be unique among drafts and among published services.
create unique index if not exists cms_drafts_service_slug on public.cms_drafts ((data ->> 'slug')) where kind = 'service';
create unique index if not exists cms_published_service_slug on public.cms_published ((data ->> 'slug')) where kind = 'service';

-- ---------------------------------------------------------------------------
-- Row level security and privileges
-- ---------------------------------------------------------------------------

alter table public.cms_drafts enable row level security;
alter table public.cms_published enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_media enable row level security;

drop policy if exists "admins read drafts" on public.cms_drafts;
create policy "admins read drafts" on public.cms_drafts
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "anyone reads published content" on public.cms_published;
create policy "anyone reads published content" on public.cms_published
  for select to anon, authenticated using (true);

drop policy if exists "admins read revisions" on public.cms_revisions;
create policy "admins read revisions" on public.cms_revisions
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "admins read media" on public.cms_media;
create policy "admins read media" on public.cms_media
  for select to authenticated using ((select public.is_admin()));

-- No direct writes for anyone through the API; only the functions below write.
revoke all on public.cms_drafts, public.cms_published, public.cms_revisions, public.cms_media from anon, authenticated;
grant select (kind, key, data, version, published_at) on public.cms_published to anon, authenticated;
grant select on public.cms_drafts, public.cms_revisions, public.cms_media to authenticated;

-- ---------------------------------------------------------------------------
-- Drafts
-- ---------------------------------------------------------------------------

-- Creates (p_expected_version null) or updates a draft. Returns the new version.
create or replace function public.cms_save_draft(p_kind text, p_key text, p_data jsonb, p_expected_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
  v_unknown text[];
begin
  perform public.cms_assert_admin();
  if not public.cms_valid_key(p_kind, p_key) then
    raise exception 'invalid document %/%', p_kind, p_key using errcode = '22023';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'document data must be an object' using errcode = '22023';
  end if;

  -- Uploaded images must be registered media (not arbitrary storage objects).
  select coalesce(array_agg(p), '{}') into v_unknown
  from unnest(public.cms_image_paths(p_data)) as p
  where not exists (select 1 from public.cms_media m where m.path = p);
  if cardinality(v_unknown) > 0 then
    raise exception 'unknown image %', v_unknown[1] using errcode = '22023';
  end if;

  if p_expected_version is null then
    insert into public.cms_drafts as d (kind, key, data, version, updated_by, updated_by_email)
    values (p_kind, p_key, p_data, 1, auth.uid(), auth.jwt() ->> 'email')
    on conflict (kind, key) do nothing
    returning d.version into v_version;
    if v_version is null then
      raise exception 'document already exists' using errcode = '40001';
    end if;
    return v_version;
  end if;

  update public.cms_drafts d
  set data = p_data,
      version = d.version + 1,
      updated_at = now(),
      updated_by = auth.uid(),
      updated_by_email = auth.jwt() ->> 'email'
  where d.kind = p_kind and d.key = p_key and d.version = p_expected_version
  returning d.version into v_version;

  if v_version is null then
    if exists (select 1 from public.cms_drafts d where d.kind = p_kind and d.key = p_key) then
      raise exception 'the draft was changed by someone else' using errcode = '40001';
    end if;
    raise exception 'document not found' using errcode = 'P0002';
  end if;
  return v_version;
end;
$$;

-- ---------------------------------------------------------------------------
-- Publishing
-- ---------------------------------------------------------------------------

-- Publishes exactly the draft version the editor reviewed. Every uploaded image
-- it references must already be in the public bucket (the dashboard copies it
-- there first). Returns the published draft version.
create or replace function public.cms_publish(p_kind text, p_key text, p_expected_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_data jsonb;
  v_version integer;
  v_paths text[];
  v_missing text[];
begin
  perform public.cms_assert_admin();

  select d.data, d.version into v_data, v_version
  from public.cms_drafts d
  where d.kind = p_kind and d.key = p_key
  for update;

  if not found then
    raise exception 'document not found' using errcode = 'P0002';
  end if;
  if p_expected_version is null or v_version <> p_expected_version then
    raise exception 'the draft was changed by someone else' using errcode = '40001';
  end if;

  v_paths := public.cms_image_paths(v_data);
  select coalesce(array_agg(p), '{}') into v_missing
  from unnest(v_paths) as p
  where not exists (select 1 from storage.objects o where o.bucket_id = 'cms-public' and o.name = p);
  if cardinality(v_missing) > 0 then
    raise exception 'image % is not public yet', v_missing[1] using errcode = 'P0001';
  end if;

  insert into public.cms_published as p (kind, key, data, version, published_at)
  values (p_kind, p_key, v_data, v_version, now())
  on conflict (kind, key) do update
    set data = excluded.data, version = excluded.version, published_at = excluded.published_at;

  insert into public.cms_revisions (kind, key, data, version, published_by, published_by_email)
  values (p_kind, p_key, v_data, v_version, auth.uid(), auth.jwt() ->> 'email');

  update public.cms_media m set public_at = coalesce(m.public_at, now()) where m.path = any (v_paths);

  return v_version;
end;
$$;

-- Takes a promotion off the site; its draft is kept.
create or replace function public.cms_unpublish(p_kind text, p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_assert_admin();
  if p_kind <> 'promotion' then
    raise exception 'only promotions can be hidden' using errcode = '22023';
  end if;
  delete from public.cms_published where kind = p_kind and key = p_key;
end;
$$;

-- Deletes a promotion, or a service that was never published. Pages, settings
-- and FAQs cannot be deleted; published services are archived instead.
create or replace function public.cms_delete(p_kind text, p_key text, p_expected_version integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_assert_admin();
  if p_kind not in ('promotion', 'service') then
    raise exception 'this content cannot be deleted' using errcode = '22023';
  end if;
  if p_kind = 'service' and exists (select 1 from public.cms_published where kind = p_kind and key = p_key) then
    raise exception 'published services are archived, not deleted' using errcode = '22023';
  end if;
  delete from public.cms_drafts
  where kind = p_kind and key = p_key and version = p_expected_version;
  if not found then
    raise exception 'the draft was changed by someone else' using errcode = '40001';
  end if;
end;
$$;

-- Loads a published revision back into the draft (it still needs publishing).
create or replace function public.cms_restore(p_revision_id bigint, p_expected_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revision public.cms_revisions;
  v_missing text[];
begin
  perform public.cms_assert_admin();
  select * into v_revision from public.cms_revisions where id = p_revision_id;
  if not found then
    raise exception 'revision not found' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(p), '{}') into v_missing
  from unnest(public.cms_image_paths(v_revision.data)) as p
  where not exists (select 1 from public.cms_media m where m.path = p);
  if cardinality(v_missing) > 0 then
    raise exception 'this version uses an image that was deleted (%)', v_missing[1] using errcode = '22023';
  end if;

  return public.cms_save_draft(v_revision.kind, v_revision.key, v_revision.data, p_expected_version);
end;
$$;

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

-- Records an uploaded draft image. Type and size are taken from Storage's own
-- metadata, not from the browser.
create or replace function public.cms_register_media(
  p_path text, p_original_name text, p_alt text, p_width integer, p_height integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb;
  v_mime text;
  v_extension text;
  v_id uuid;
begin
  perform public.cms_assert_admin();
  select o.metadata into v_meta from storage.objects o where o.bucket_id = 'cms-drafts' and o.name = p_path;
  if not found then
    raise exception 'upload not found' using errcode = 'P0002';
  end if;
  v_mime := v_meta ->> 'mimetype';
  v_extension := case v_mime
    when 'image/jpeg' then 'jpg' when 'image/png' then 'png'
    when 'image/webp' then 'webp' when 'image/avif' then 'avif' end;
  if v_extension is null or split_part(p_path, '.', 2) <> v_extension then
    raise exception 'unsupported image type' using errcode = '22023';
  end if;

  insert into public.cms_media (path, mime_type, size_bytes, width, height, alt, original_name, created_by)
  values (p_path, v_mime, (v_meta ->> 'size')::integer, p_width, p_height,
          left(coalesce(p_alt, ''), 200), left(coalesce(p_original_name, ''), 200), auth.uid())
  on conflict (path) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.cms_media where path = p_path;
  end if;
  return v_id;
end;
$$;

create or replace function public.cms_update_media(p_id uuid, p_alt text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_assert_admin();
  update public.cms_media set alt = left(coalesce(p_alt, ''), 200) where id = p_id;
  if not found then
    raise exception 'media not found' using errcode = 'P0002';
  end if;
end;
$$;

-- Where a file is used: in drafts, in published content, or only in history.
create or replace function public.cms_media_usage(p_path text)
returns table (kind text, key text, state text)
language sql
stable
security definer
set search_path = ''
as $$
  select d.kind, d.key, 'draft' from public.cms_drafts d
  where public.is_admin() and p_path = any (public.cms_image_paths(d.data))
  union all
  select p.kind, p.key, 'published' from public.cms_published p
  where public.is_admin() and p_path = any (public.cms_image_paths(p.data));
$$;

-- Deletes a media record that no draft or published document uses. Returns the
-- path so the dashboard can remove the stored files.
create or replace function public.cms_delete_media(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_path text;
begin
  perform public.cms_assert_admin();
  select path into v_path from public.cms_media where id = p_id for update;
  if not found then
    raise exception 'media not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.cms_media_usage(v_path)) then
    raise exception 'this image is still in use' using errcode = '23503';
  end if;
  delete from public.cms_media where id = p_id;
  return v_path;
end;
$$;

-- Public copies that no published document uses any more.
create or replace function public.cms_unused_public_media()
returns setof public.cms_media
language sql
stable
security definer
set search_path = ''
as $$
  select m.* from public.cms_media m
  where public.is_admin()
    and m.public_at is not null
    and not exists (
      select 1 from public.cms_published p where m.path = any (public.cms_image_paths(p.data))
    );
$$;

-- Marks public copies as removed, re-checking that nothing published uses them.
create or replace function public.cms_mark_media_private(p_ids uuid[])
returns setof text
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_assert_admin();
  return query
  update public.cms_media m set public_at = null
  where m.id = any (p_ids)
    and not exists (select 1 from public.cms_published p where m.path = any (public.cms_image_paths(p.data)))
  returning m.path;
end;
$$;

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------

revoke execute on function public.cms_assert_admin() from public, anon, authenticated;
revoke execute on function public.cms_save_draft(text, text, jsonb, integer) from public, anon;
revoke execute on function public.cms_publish(text, text, integer) from public, anon;
revoke execute on function public.cms_unpublish(text, text) from public, anon;
revoke execute on function public.cms_delete(text, text, integer) from public, anon;
revoke execute on function public.cms_restore(bigint, integer) from public, anon;
revoke execute on function public.cms_register_media(text, text, text, integer, integer) from public, anon;
revoke execute on function public.cms_update_media(uuid, text) from public, anon;
revoke execute on function public.cms_media_usage(text) from public, anon;
revoke execute on function public.cms_delete_media(uuid) from public, anon;
revoke execute on function public.cms_unused_public_media() from public, anon;
revoke execute on function public.cms_mark_media_private(uuid[]) from public, anon;

grant execute on function public.cms_save_draft(text, text, jsonb, integer) to authenticated;
grant execute on function public.cms_publish(text, text, integer) to authenticated;
grant execute on function public.cms_unpublish(text, text) to authenticated;
grant execute on function public.cms_delete(text, text, integer) to authenticated;
grant execute on function public.cms_restore(bigint, integer) to authenticated;
grant execute on function public.cms_register_media(text, text, text, integer, integer) to authenticated;
grant execute on function public.cms_update_media(uuid, text) to authenticated;
grant execute on function public.cms_media_usage(text) to authenticated;
grant execute on function public.cms_delete_media(uuid) to authenticated;
grant execute on function public.cms_unused_public_media() to authenticated;
grant execute on function public.cms_mark_media_private(uuid[]) to authenticated;
