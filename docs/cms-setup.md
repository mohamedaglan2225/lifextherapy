# Content dashboard: setup and operation

The dashboard at `/admin` lets the owner manage the website without editing code:

- every page (home, about, services overview, contact, FAQ, privacy, terms) and the shared service-page layout
- sections: edit, add from templates (image and text, banner, cards, gallery, testimonials, call to action), reorder, duplicate, hide, remove
- services: text, images, sessions, prices, per-session Vagaro links, order, archive, address changes with redirects
- FAQs, promotions with Eastern Time scheduling, global settings, SEO and share images
- media library, drafts, authenticated preview, publishing history and restore

It uses Supabase (Free plan) for sign-in, the database and image storage. Until the
two environment variables below are set, the website runs on its built-in content
(identical to the original site) and `/admin` shows "Not connected yet".

## Environment variables

| Variable | Required | Where it comes from | Secret? |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → project → **Connect** | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase → **Settings → API Keys** → Publishable key (`sb_publishable_…`) | No |
| `NEXT_PUBLIC_SITE_URL` | yes, in production | the live address, e.g. `https://lifextherapy.com` | No |
| `CMS_SCHEDULE_REFRESH_SECONDS` | no | how often pages showing promotions re-check schedules; default 300, allowed 30–3600 | No |

The site never needs the Supabase **secret** or **service_role** key. Do not add
either to the project, Vercel, or chat. Every write is made with the signed-in
owner's own session and checked by the database.

## Setup procedure (in this order)

### 1. Create the Supabase project

1. At supabase.com create a project on the **Free** plan, region **East US (North Virginia)**.
2. Keep the database password in a password manager. The website does not use it.

### 2. Database, storage and permissions

In **SQL Editor → New query**, run each file's full contents, in order:

1. `supabase/migrations/20261014000000_cms_mvp.sql`: admin membership, the two image buckets and their policies.
2. `supabase/migrations/20261020000000_cms_documents.sql`: content tables, row level security, and the save, publish, history and media functions.
3. `supabase/seed.sql`: the website's current content.
4. `supabase/tests/rls_check.sql`: must end with one row reading **`all CMS checks passed`**. It runs in a rolled-back transaction and leaves nothing behind. If it reports `FAIL: …`, stop and report the message.

Every file is safe to run again. The seed never overwrites content that already
exists. On a project where the earlier MVP dashboard was used, run only the files
not applied yet (2–4). The seed then carries over the MVP's hero, contact details,
social links, promotions and uploaded images instead of the defaults. The old MVP
tables stay in place, unused.

### 3. Sign-in settings

**Authentication → Sign In / Providers**:

1. Turn **off** "Allow new users to sign up". Keep **Email** enabled.
2. Under **Email**, set the minimum password length to at least 12.

**Authentication → URL Configuration**: set **Site URL** to the live address.

Even with sign-ups on, a new account gets nothing: dashboard access needs a row in
`public.admins`, which cannot be written through the website or the API.

### 4. Owner account

1. **Authentication → Users → Add user → Create new user**: enter the owner's email and a strong password, and tick **Auto Confirm User**.
2. In **SQL Editor**, grant dashboard access (replace the email):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```

   To remove access: `delete from public.admins where user_id = (select id from auth.users where email = 'owner@example.com');`

### 5. Local check

Create `.env.local` (git-ignored) with the variables above. Then run `npm run dev`,
open http://localhost:3000/admin, sign in, and confirm that the public pages look
unchanged.

### 6. Deployment

1. Add the variables to the hosting provider. On Vercel: **Settings → Environment Variables**, first for **Preview**.
2. Deploy a preview of this branch, sign in at `/admin` on the preview and publish a small test change.
3. When approved, add the variables to **Production** and deploy. `NEXT_PUBLIC_` values are fixed at build time, so redeploy after changing them.

## How publishing works

- **Save draft** stores changes privately. **Preview draft** opens the page with your drafts, visible only in your signed-in browser. **Publish** makes it live.
- Publishing is one database transaction. It checks the draft version you reviewed, confirms every image is public, writes the published content, and records the version in **Publishing history**.
- The affected pages refresh on their next visit, with no rebuild or redeploy. If the refresh step fails after a successful publish, the dashboard says so and offers **Refresh live site**; **Overview → Refresh entire live site** does the same for every page. Pages also re-check the database at least hourly.
- **History → Restore as draft** loads any published version into the draft for review before publishing again.
- If two people edit the same item, the second save is refused with "Someone else saved this". Nothing is overwritten silently.

## Promotions and timing

Times are entered in Eastern Time (New York) and stored as exact UTC instants, so
daylight-saving changes are handled correctly.

- **Start:** a promotion appears within `CMS_SCHEDULE_REFRESH_SECONDS` (default 5 minutes) after its start time. A page serves its cached version until someone requests it after the refresh interval, so on a quiet site the first visitor after the start can still see the earlier page, and the next visitor sees the promotion. Upcoming promotions are never in the page early.
- **End:** an open page hides a promotion at its exact end time in the visitor's browser, and the server stops including it within the same refresh window.
- A promotion only appears on pages that have a **Promotions** section. Home and Services have one by default.

## Outages and cold caches

- If Supabase is unreachable, visitors keep getting the last successfully published pages. A failed refresh never replaces them with built-in or partial content.
- **Cold-cache limitation:** a page that has never been generated since the last deploy (for example the first visit to a service published after the build) needs Supabase to render. During an outage such pages show an error until Supabase is back. Prebuilt pages are not affected.
- While Supabase is connected, a deploy fails on purpose if Supabase is unreachable during the build, so outdated built-in content is never shipped. The previous deployment stays live.

## Security model

- Drafts, published content, history and media live in separate tables. Visitors can read published content only. Drafts, history, media and admin membership are not readable by visitors or by signed-in non-admins.
- No one writes the tables directly. Every change goes through a database function that checks `is_admin()` first. The dashboard checks admin status on every page and in every action, and the database checks again.
- Uploads go to a private bucket: JPG, PNG, WebP or AVIF only (no SVG), at most 5 MB, file names generated by the dashboard. Type and size are verified from Storage's own records. An image becomes public only when content using it is published.
- Links must be pages on this site (`/services`) or `https://` addresses. Session booking links must be `vagaro.com` links. Published content is validated again when the website reads it.

## Media library

- Images in use cannot be deleted, and the library shows where each one is used.
- **Replace in drafts** swaps an image everywhere it is used in drafts. Publish those drafts afterwards.
- **Clean up** removes public copies no published page uses (the private original stays, so history can be restored) and stray files from interrupted uploads more than an hour old.

## Supabase Free plan notes

- 500 MB database, 1 GB storage, 5 GB egress per month.
- **Projects pause after a week of inactivity.** The live website keeps serving its published pages, but sign-in and newly generated pages need the project restored from the Supabase dashboard. Hourly page refreshes usually keep the project active, but that is not guaranteed. Only a paid plan prevents pausing.
- **No automatic backups.** After significant changes, export `cms_drafts`, `cms_published`, `cms_revisions` and `cms_media` from the Table Editor (or `pg_dump`).

## Maintenance

- Built-in content lives in `src/lib/cms/defaults/site-content.json`. `npm run cms:seed` regenerates `supabase/seed.sql` from it.
- Microcopy inside components (for example "Learn More" on service cards, the 404 page, and the Phone/Email/Address labels) is not editable from the dashboard.
