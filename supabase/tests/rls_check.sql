-- CMS permission check. Run the whole file in the Supabase SQL editor after the
-- migration and seed. Everything happens inside one transaction that is rolled
-- back at the end, so it leaves no data behind.
--
-- Success: the final result is a single row reading `all CMS permission checks passed`.
-- Failure: the script stops with an error that names the check that failed.

begin;

-- Throwaway users that exist only inside this transaction.
insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-4000-8000-00000000a001', 'authenticated', 'authenticated', 'rls-check-admin@example.invalid'),
  ('00000000-0000-4000-8000-00000000b002', 'authenticated', 'authenticated', 'rls-check-visitor@example.invalid');
insert into public.admins (user_id) values ('00000000-0000-4000-8000-00000000a001');

insert into public.promotion_drafts (id, title) values ('00000000-0000-4000-8000-0000000c0001', 'RLS check draft promotion');
insert into public.content_drafts (key, data)
values ('home_hero', '{"rls_check": "draft"}'::jsonb)
on conflict (key) do update set data = public.content_drafts.data || '{"rls_check": "draft"}'::jsonb;

-- ---------------------------------------------------------------- anonymous visitor
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare n integer;
begin
  begin
    perform 1 from public.content_drafts;
    raise exception 'FAIL: anon can read content_drafts';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.promotion_drafts;
    raise exception 'FAIL: anon can read promotion_drafts';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.admins;
    raise exception 'FAIL: anon can read admins';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.content_published (key, data) values ('contact', '{}') on conflict do nothing;
    raise exception 'FAIL: anon can insert published content';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.content_published set data = '{}';
    raise exception 'FAIL: anon can update published content';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.promotions_published;
    raise exception 'FAIL: anon can delete published promotions';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.publish_content('home_hero');
    raise exception 'FAIL: anon can call publish_content';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.publish_promotion('00000000-0000-4000-8000-0000000c0001');
    raise exception 'FAIL: anon can call publish_promotion';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('cms-public', '00000000-0000-4000-8000-000000000001.jpg');
    raise exception 'FAIL: anon can upload to cms-public';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('cms-drafts', '00000000-0000-4000-8000-000000000002.jpg');
    raise exception 'FAIL: anon can upload to cms-drafts';
  exception when insufficient_privilege then null;
  end;

  select count(*) into n from storage.objects where bucket_id = 'cms-drafts';
  if n <> 0 then raise exception 'FAIL: anon can list draft media'; end if;

  select count(*) into n from public.content_published;
  if n = 0 then raise exception 'FAIL: anon cannot read published content (did the seed run?)'; end if;

  begin
    perform published_by from public.content_published;
    raise exception 'FAIL: anon can read who published content';
  exception when insufficient_privilege then null;
  end;

  perform 1 from public.promotions_published;
end;
$$;

-- --------------------------------------------- signed-in user who is not an admin
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000b002","role":"authenticated"}', true);

do $$
declare n integer;
begin
  if public.is_admin() then raise exception 'FAIL: non-admin is_admin() returned true'; end if;

  select count(*) into n from public.content_drafts;
  if n <> 0 then raise exception 'FAIL: non-admin can read content drafts'; end if;

  select count(*) into n from public.promotion_drafts;
  if n <> 0 then raise exception 'FAIL: non-admin can read promotion drafts'; end if;

  begin
    insert into public.promotion_drafts (title) values ('injected');
    raise exception 'FAIL: non-admin can create promotion drafts';
  exception when insufficient_privilege then null;
  end;

  update public.content_drafts set data = '{}' where key = 'home_hero';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-admin can update content drafts'; end if;

  begin
    perform public.publish_content('home_hero');
    raise exception 'FAIL: non-admin can publish content';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.unpublish_promotion('00000000-0000-4000-8000-0000000c0001');
    raise exception 'FAIL: non-admin can unpublish promotions';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.admins (user_id) values ('00000000-0000-4000-8000-00000000b002');
    raise exception 'FAIL: non-admin can make themselves an admin';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.content_published (key, data) values ('contact', '{}') on conflict do nothing;
    raise exception 'FAIL: non-admin can write published content directly';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('cms-public', '00000000-0000-4000-8000-000000000003.jpg');
    raise exception 'FAIL: non-admin can upload public media';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- ------------------------------------------------------------------------- admin
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000a001","role":"authenticated"}', true);

do $$
declare n integer;
begin
  if not public.is_admin() then raise exception 'FAIL: admin is_admin() returned false'; end if;

  select count(*) into n from public.content_drafts where key = 'home_hero';
  if n <> 1 then raise exception 'FAIL: admin cannot read content drafts'; end if;

  begin
    insert into public.content_published (key, data) values ('contact', '{}') on conflict do nothing;
    raise exception 'FAIL: admin can bypass publish_content and write published rows directly';
  exception when insufficient_privilege then null;
  end;

  perform public.publish_content('home_hero');
  select count(*) into n from public.content_published where key = 'home_hero' and data ? 'rls_check';
  if n <> 1 then raise exception 'FAIL: admin publish_content did not publish the draft'; end if;

  perform public.publish_promotion('00000000-0000-4000-8000-0000000c0001');
  select count(*) into n from public.promotions_published where id = '00000000-0000-4000-8000-0000000c0001';
  if n <> 1 then raise exception 'FAIL: admin publish_promotion did not publish'; end if;

  perform public.unpublish_promotion('00000000-0000-4000-8000-0000000c0001');
  select count(*) into n from public.promotions_published where id = '00000000-0000-4000-8000-0000000c0001';
  if n <> 0 then raise exception 'FAIL: admin unpublish_promotion did not hide the promotion'; end if;

  begin
    insert into public.promotion_drafts (title, link_url) values ('bad link', '/\evil.example');
    raise exception 'FAIL: a backslash link that leaves the site was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.promotion_drafts (title, link_url) values ('bad link', 'javascript:alert(1)');
    raise exception 'FAIL: a javascript: link was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('cms-drafts', '../escape.jpg');
    raise exception 'FAIL: an unsafe media file name was accepted';
  exception when insufficient_privilege then null;
  end;

  insert into storage.objects (bucket_id, name) values ('cms-drafts', '00000000-0000-4000-8000-000000000004.webp');
end;
$$;

reset role;
select 'all CMS permission checks passed' as result;

rollback;
