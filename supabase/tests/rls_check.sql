-- CMS permission and integrity check. Run the whole file in the Supabase SQL
-- editor after the migrations and the seed. Everything happens inside one
-- transaction that is rolled back, so it leaves no data behind.
--
-- Success: the final result is one row reading `all CMS checks passed`.
-- Failure: the script stops with an error that names the failed check.

begin;

-- Runs a statement and requires it to fail with the given SQLSTATE.
create function pg_temp.expect_error(p_sql text, p_state text, p_label text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlstate = p_state then return; end if;
    raise exception 'FAIL: % (expected %, got %: %)', p_label, p_state, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL: % (statement succeeded)', p_label;
end;
$$;

-- Throwaway users that exist only inside this transaction.
insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-00000000a001', 'authenticated', 'authenticated', 'rls-check-admin@example.invalid'),
  ('00000000-0000-4000-8000-00000000b002', 'authenticated', 'authenticated', 'rls-check-visitor@example.invalid');
insert into public.admins (user_id) values ('00000000-0000-4000-8000-00000000a001');

-- A draft-only promotion and a private upload to probe privacy.
insert into public.cms_drafts (kind, key, data)
values ('promotion', '00000000-0000-4000-8000-0000000c0001', '{"title": "secret draft promotion"}');
insert into storage.objects (bucket_id, name, metadata)
values ('cms-drafts', '00000000-0000-4000-8000-0000000d0001.jpg', '{"mimetype": "image/jpeg", "size": 1000}');

-- ------------------------------------------------------------ anonymous visitor
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare n integer;
begin
  select count(*) into n from public.cms_published where kind = 'page';
  if n < 8 then raise exception 'FAIL: published pages are missing (did the seed run?)'; end if;
  select count(*) into n from public.cms_published where kind = 'promotion' and key = '00000000-0000-4000-8000-0000000c0001';
  if n <> 0 then raise exception 'FAIL: a draft promotion is visible as published'; end if;

  perform pg_temp.expect_error('select 1 from public.cms_drafts', '42501', 'anon reads drafts');
  perform pg_temp.expect_error('select 1 from public.cms_revisions', '42501', 'anon reads revisions');
  perform pg_temp.expect_error('select 1 from public.cms_media', '42501', 'anon reads media');
  perform pg_temp.expect_error('select 1 from public.admins', '42501', 'anon reads admins');
  perform pg_temp.expect_error($q$insert into public.cms_published (kind, key, data) values ('page', 'home', '{}')$q$, '42501', 'anon writes published');
  perform pg_temp.expect_error($q$update public.cms_published set data = '{}'$q$, '42501', 'anon updates published');
  perform pg_temp.expect_error($q$delete from public.cms_published$q$, '42501', 'anon deletes published');
  perform pg_temp.expect_error($q$insert into public.cms_drafts (kind, key, data) values ('page', 'home', '{}')$q$, '42501', 'anon writes drafts');
  perform pg_temp.expect_error($q$select public.cms_save_draft('page', 'home', '{}', 1)$q$, '42501', 'anon saves a draft');
  perform pg_temp.expect_error($q$select public.cms_publish('page', 'home', 1)$q$, '42501', 'anon publishes');
  perform pg_temp.expect_error($q$select public.cms_unpublish('promotion', '00000000-0000-4000-8000-0000000c0001')$q$, '42501', 'anon unpublishes');
  perform pg_temp.expect_error($q$select public.cms_delete('promotion', '00000000-0000-4000-8000-0000000c0001', 1)$q$, '42501', 'anon deletes');
  perform pg_temp.expect_error($q$select public.cms_restore(1, 1)$q$, '42501', 'anon restores');
  perform pg_temp.expect_error($q$select public.cms_register_media('00000000-0000-4000-8000-0000000d0001.jpg', '', '', 1, 1)$q$, '42501', 'anon registers media');
  perform pg_temp.expect_error($q$select public.cms_delete_media(gen_random_uuid())$q$, '42501', 'anon deletes media');
  perform pg_temp.expect_error($q$select * from public.cms_media_usage('x')$q$, '42501', 'anon reads media usage');
  perform pg_temp.expect_error($q$insert into storage.objects (bucket_id, name) values ('cms-public', '00000000-0000-4000-8000-0000000d0009.jpg')$q$, '42501', 'anon uploads public media');
  perform pg_temp.expect_error($q$insert into storage.objects (bucket_id, name) values ('cms-drafts', '00000000-0000-4000-8000-0000000d0008.jpg')$q$, '42501', 'anon uploads draft media');

  select count(*) into n from storage.objects where bucket_id = 'cms-drafts';
  if n <> 0 then raise exception 'FAIL: anon can list private uploads'; end if;
end;
$$;

-- ------------------------------------------------- signed-in user who is not an admin
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000b002","role":"authenticated","email":"rls-check-visitor@example.invalid"}', true);

do $$
declare n integer;
begin
  if public.is_admin() then raise exception 'FAIL: non-admin is_admin() returned true'; end if;
  select count(*) into n from public.cms_drafts;
  if n <> 0 then raise exception 'FAIL: non-admin can read drafts'; end if;
  select count(*) into n from public.cms_media;
  if n <> 0 then raise exception 'FAIL: non-admin can read media'; end if;
  select count(*) into n from public.cms_revisions;
  if n <> 0 then raise exception 'FAIL: non-admin can read revisions'; end if;
  select count(*) into n from public.cms_media_usage('00000000-0000-4000-8000-0000000d0001.jpg');
  if n <> 0 then raise exception 'FAIL: non-admin can read media usage'; end if;
  select count(*) into n from public.cms_unused_public_media();
  if n <> 0 then raise exception 'FAIL: non-admin can list public media'; end if;

  perform pg_temp.expect_error($q$select public.cms_save_draft('page', 'home', '{}', 1)$q$, '42501', 'non-admin saves a draft');
  perform pg_temp.expect_error($q$select public.cms_publish('page', 'home', 1)$q$, '42501', 'non-admin publishes');
  perform pg_temp.expect_error($q$select public.cms_unpublish('promotion', '00000000-0000-4000-8000-0000000c0001')$q$, '42501', 'non-admin hides a promotion');
  perform pg_temp.expect_error($q$select public.cms_delete('promotion', '00000000-0000-4000-8000-0000000c0001', 1)$q$, '42501', 'non-admin deletes');
  perform pg_temp.expect_error($q$select public.cms_register_media('00000000-0000-4000-8000-0000000d0001.jpg', '', '', 1, 1)$q$, '42501', 'non-admin registers media');
  perform pg_temp.expect_error($q$select public.cms_update_media(gen_random_uuid(), 'x')$q$, '42501', 'non-admin edits media');
  perform pg_temp.expect_error($q$select public.cms_mark_media_private(array[gen_random_uuid()])$q$, '42501', 'non-admin removes public media');
  perform pg_temp.expect_error($q$insert into public.cms_drafts (kind, key, data) values ('page', 'home', '{}')$q$, '42501', 'non-admin writes drafts directly');
  perform pg_temp.expect_error($q$insert into public.cms_published (kind, key, data) values ('page', 'home', '{}')$q$, '42501', 'non-admin writes published directly');
  perform pg_temp.expect_error($q$insert into public.admins (user_id) values ('00000000-0000-4000-8000-00000000b002')$q$, '42501', 'non-admin makes themselves an admin');
  perform pg_temp.expect_error($q$insert into storage.objects (bucket_id, name) values ('cms-public', '00000000-0000-4000-8000-0000000d0007.jpg')$q$, '42501', 'non-admin uploads public media');
end;
$$;

-- ------------------------------------------------------------------------- admin
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000a001","role":"authenticated","email":"rls-check-admin@example.invalid"}', true);

do $$
declare
  n integer;
  v integer;
  v_revision bigint;
  v_media uuid;
  v_key constant text := '00000000-0000-4000-8000-0000000e0001';
begin
  if not public.is_admin() then raise exception 'FAIL: admin is_admin() returned false'; end if;
  select count(*) into n from public.cms_drafts where kind = 'page';
  if n < 8 then raise exception 'FAIL: admin cannot read drafts'; end if;

  -- Even admins only write through the functions.
  perform pg_temp.expect_error($q$insert into public.cms_published (kind, key, data) values ('page', 'home', '{}')$q$, '42501', 'admin writes published directly');
  perform pg_temp.expect_error($q$update public.cms_drafts set data = '{}'$q$, '42501', 'admin updates drafts directly');
  perform pg_temp.expect_error($q$insert into public.admins (user_id) values ('00000000-0000-4000-8000-00000000b002')$q$, '42501', 'admin grants admin through the API');

  -- Create, version conflicts, publish, history, restore.
  v := public.cms_save_draft('promotion', v_key, '{"title": "one"}', null);
  if v <> 1 then raise exception 'FAIL: new draft should be version 1'; end if;
  perform pg_temp.expect_error(format($q$select public.cms_save_draft('promotion', %L, '{"title": "dup"}', null)$q$, v_key), '40001', 'creating an existing draft');
  v := public.cms_save_draft('promotion', v_key, '{"title": "two"}', 1);
  if v <> 2 then raise exception 'FAIL: saved draft should be version 2'; end if;
  perform pg_temp.expect_error(format($q$select public.cms_save_draft('promotion', %L, '{"title": "stale"}', 1)$q$, v_key), '40001', 'saving over a newer draft');
  perform pg_temp.expect_error(format($q$select public.cms_publish('promotion', %L, 1)$q$, v_key), '40001', 'publishing a stale version');
  perform public.cms_publish('promotion', v_key, 2);
  select count(*) into n from public.cms_published where kind = 'promotion' and key = v_key and data ->> 'title' = 'two';
  if n <> 1 then raise exception 'FAIL: publish did not publish'; end if;
  select id into v_revision from public.cms_revisions where kind = 'promotion' and key = v_key order by id desc limit 1;
  if v_revision is null then raise exception 'FAIL: publish did not record a revision'; end if;
  v := public.cms_save_draft('promotion', v_key, '{"title": "three"}', 2);
  v := public.cms_restore(v_revision, v);
  select count(*) into n from public.cms_drafts where kind = 'promotion' and key = v_key and data ->> 'title' = 'two' and version = 4;
  if n <> 1 then raise exception 'FAIL: restore did not load the revision into the draft'; end if;
  perform public.cms_unpublish('promotion', v_key);
  select count(*) into n from public.cms_published where kind = 'promotion' and key = v_key;
  if n <> 0 then raise exception 'FAIL: unpublish did not hide the promotion'; end if;

  -- Content rules.
  perform pg_temp.expect_error($q$select public.cms_save_draft('page', 'not-a-page', '{}', null)$q$, '22023', 'saving an unknown page');
  perform pg_temp.expect_error($q$select public.cms_unpublish('page', 'home')$q$, '22023', 'hiding a page');
  perform pg_temp.expect_error($q$select public.cms_delete('page', 'home', 1)$q$, '22023', 'deleting a page');
  perform pg_temp.expect_error(format($q$select public.cms_delete('service', %L, 1)$q$,
    (select key from public.cms_published where kind = 'service' limit 1)), '22023', 'deleting a published service');

  -- Media: only registered uploads, public before publish, no deleting what is used.
  perform pg_temp.expect_error(format($q$select public.cms_save_draft('promotion', %L, '{"title": "x", "image": {"src": "00000000-0000-4000-8000-0000000d0001.jpg"}}', 4)$q$, v_key), '22023', 'referencing an unregistered upload');
  perform pg_temp.expect_error($q$select public.cms_register_media('00000000-0000-4000-8000-0000000d0099.jpg', '', '', 1, 1)$q$, 'P0002', 'registering a missing upload');
  v_media := public.cms_register_media('00000000-0000-4000-8000-0000000d0001.jpg', 'photo.jpg', 'A photo', 800, 600);
  v := public.cms_save_draft('promotion', v_key, '{"title": "x", "image": {"src": "00000000-0000-4000-8000-0000000d0001.jpg"}}', 4);
  perform pg_temp.expect_error(format($q$select public.cms_publish('promotion', %L, %s)$q$, v_key, v), 'P0001', 'publishing an image that is not public');
  perform pg_temp.expect_error(format($q$select public.cms_delete_media(%L)$q$, v_media), '23503', 'deleting an image that is in use');
  insert into storage.objects (bucket_id, name) values ('cms-public', '00000000-0000-4000-8000-0000000d0001.jpg');
  perform public.cms_publish('promotion', v_key, v);
  select count(*) into n from public.cms_media where id = v_media and public_at is not null;
  if n <> 1 then raise exception 'FAIL: publishing did not mark the image public'; end if;

  -- Uploads are limited to admins and to safe file names.
  perform pg_temp.expect_error($q$insert into storage.objects (bucket_id, name) values ('cms-drafts', '../escape.jpg')$q$, '42501', 'unsafe upload name');
  insert into storage.objects (bucket_id, name) values ('cms-drafts', '00000000-0000-4000-8000-0000000d0002.webp');
end;
$$;

reset role;
select 'all CMS checks passed' as result;

rollback;
