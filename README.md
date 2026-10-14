# Life X Therapy

Marketing site for Life X Therapy — massage therapy & bodywork.
Next.js (App Router) + TypeScript + Tailwind CSS.

## Local development
```bash
npm install
npm run dev
```

## Configuration
Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL` — production domain, used for canonical URLs, Open
  Graph and the sitemap.

All page content, services (including per-session Vagaro links), FAQs,
promotions and site settings are managed in the owner dashboard at `/admin`.
Without Supabase configured, the site uses the built-in content in
`src/lib/cms/defaults/site-content.json`, which matches the original pages.
Booking and payment are handled externally by Vagaro; the site has no internal
checkout.

## Content dashboard

Setup, the security model, publishing and scheduling behaviour, and Free plan
notes are in [`docs/cms-setup.md`](docs/cms-setup.md). Database migrations,
the generated seed (`npm run cms:seed`) and the permission check live in
`supabase/`.
