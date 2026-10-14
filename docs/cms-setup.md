# Content dashboard setup

The dashboard at `/admin` lets the owner edit the home hero, contact details,
social links and promotions without touching code. It uses Supabase (Free plan)
for sign-in, the database and image storage.

Until the two environment variables below are set, the website runs exactly as
before on its built-in content and `/admin` shows a "Not connected yet" page.

## What you need

| Variable | Where it comes from | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → your project → **Connect** (or **Settings → API Keys**) | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → **Settings → API Keys** → Publishable key (`sb_publishable_…`) | No |

Both values are public by design. The site never needs the Supabase **secret**
or **service_role** key. Do not add either to the project, Vercel, or chat.

## 1. Create the Supabase project

1. Sign in at supabase.com and create a new project on the **Free** plan.
2. Region: **East US (North Virginia)**, which is closest to Florida and to Vercel's default region.
3. Save the database password in a password manager. The dashboard does not use it.

## 2. Create the tables, permissions and storage

In Supabase open **SQL Editor → New query** and run these files from this
repository **in order**, pasting each file's full contents:

1. `supabase/migrations/20261014000000_cms_mvp.sql` creates the tables, Row Level
   Security policies, publish functions and the two storage buckets.
2. `supabase/seed.sql` loads the content the website shows today, so nothing
   changes when the dashboard is connected. Safe to re-run; it never overwrites edits.
3. `supabase/tests/rls_check.sql` checks the permissions. The result must be one
   row reading **`all CMS permission checks passed`**. It runs in a transaction that
   is rolled back, so it leaves nothing behind. If it reports `FAIL: …`, stop and
   report the message.

## 3. Lock down sign-in

In **Authentication**:

1. **Sign In / Providers**: turn **off** "Allow new users to sign up". Keep the
   **Email** provider enabled.
2. **Sign In / Providers → Email**: set the minimum password length to at least 12.
3. **URL Configuration**: set **Site URL** to the production address of the website.

Even if sign-ups were left on, a new account can do nothing: dashboard access
requires a row in the `admins` table, which only you can add.

## 4. Create the owner's login

1. **Authentication → Users → Add user → Create new user**. Enter the owner's email
   and a strong password, and tick **Auto Confirm User**. Give the password to the
   owner privately (not by email or chat if you can avoid it).
2. In **SQL Editor**, grant dashboard access, replacing the email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```

   To remove access later: `delete from public.admins where user_id = (select id from auth.users where email = 'owner@example.com');`

## 5. Connect the site locally

Create `.env.local` in the project root (it is git-ignored):

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Then run `npm run dev`, open http://localhost:3000/admin and sign in.

## 6. Connect a Vercel deployment (when approved)

1. Vercel → project → **Settings → Environment Variables**: add the two
   `NEXT_PUBLIC_SUPABASE_*` variables. Start with the **Preview** environment and
   test a preview deployment of this branch before adding them to **Production**.
2. Redeploy after adding or changing them. `NEXT_PUBLIC_` values are baked in at
   build time.
3. While Supabase is connected, every build reads the published content. If Supabase
   is unreachable during a build, the build fails on purpose and the previous
   deployment stays live, so outdated built-in content is never shipped.

## How publishing works

- **Save draft** stores changes privately. Visitors keep seeing the published version.
- **Save & publish** copies the draft to the published tables and copies any new
  image from the private `cms-drafts` bucket to the public `cms-public` bucket.
- The affected pages refresh on the next visit, with no rebuild or redeploy. Pages
  also re-check the database at most once an hour, which picks up changes made
  directly in Supabase.
- If Supabase is briefly unavailable, visitors keep getting the last successfully
  published pages.
- Promotions appear on the home page, below the hero, while they are **Live**.
  **Hide** takes one off the site and keeps it as a draft. **Delete** removes it.

## Security model

- Drafts and published content live in separate tables. Anonymous visitors have no
  access to draft tables at all and read-only access to published tables.
- Only the publish functions can write published content, and each checks that the
  caller is an admin.
- The dashboard checks admin status on every page and in every save or publish
  action. The database checks it again through Row Level Security.
- Images: JPG, PNG, WebP or AVIF only (no SVG), at most 5 MB. Uploads go to a
  private bucket. Only admins can upload, and images become public only when the
  content using them is published.
- Links entered in the dashboard must be pages on this site (`/services`) or
  `https://` addresses. The hero's booking button always uses the Vagaro links in
  `src/config/vagaro.ts`. Only its text is editable.

## Supabase Free plan notes

- 500 MB database, 1 GB file storage, 5 GB egress per month, 50,000 monthly active users.
- **Projects are paused after a week of inactivity.** The website keeps serving its
  last published pages while paused, but the dashboard cannot sign in. Restore the
  project from the Supabase dashboard. Hourly page refreshes usually keep the project
  active, but that is not guaranteed. Only a paid plan prevents pausing.
- **No automatic backups.** Export the `content_*` and `promotion*` tables from the
  Table Editor after significant changes.

## Not in this milestone

Services, FAQs, other pages, reusable sections, scheduled promotions (start/end
dates), preview before publishing, restoring an earlier version (revisions are
already recorded in `content_revisions`), and clean-up of unused uploaded images.
