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

Vagaro booking links live only in `src/config/vagaro.ts`: set a service's
exact Vagaro URL per duration there, otherwise its Book buttons open the Life X
Therapy Vagaro business page. Booking and payment are handled externally by
Vagaro; the site has no internal checkout.

Business details (phone, email, address, hours, therapist name and bio,
testimonials) are placeholders in `src/config/site.ts` and `src/data/content.ts`.
