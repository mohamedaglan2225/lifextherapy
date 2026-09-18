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

- `NEXT_PUBLIC_VAGARO_BOOKING_URL` — every booking CTA links here. Booking and
  payment are handled externally by Vagaro; the site has no internal checkout.
- `NEXT_PUBLIC_SITE_URL` — production domain, used for canonical URLs, Open
  Graph and the sitemap.

Business details (phone, email, address, hours, therapist name and bio,
testimonials) are placeholders in `src/config/site.ts` and `src/data/content.ts`.
