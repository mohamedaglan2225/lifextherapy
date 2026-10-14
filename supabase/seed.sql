-- Initial CMS content: exactly what the website shows today.
--
-- Safe to run more than once. `on conflict do nothing` means rows the owner has
-- already edited or published are never overwritten.
--
-- No promotions are seeded, so the public site looks unchanged until the owner
-- publishes one.

create temporary table cms_seed (key text primary key, data jsonb not null);

insert into cms_seed (key, data)
values
  ('home_hero', $json${
    "eyebrow": "Massage Therapy & Bodywork",
    "headline": "Feel Better.\nMove Better.",
    "headlineEmphasis": "Live Calmer.",
    "body": "Personalized massage therapy and bodywork designed to relieve tension, restore movement, and help you feel your best.",
    "image": "/images/hero-massage.jpg",
    "imageAlt": "Massage therapist working on a client in a warmly lit studio",
    "primaryLabel": "Book a Session",
    "secondaryLabel": "Explore Services",
    "secondaryHref": "/services"
  }$json$::jsonb),
  ('contact', $json${
    "phone": "(321) 467-4569",
    "email": "",
    "address": "1541 S Wickham Rd, West Melbourne, FL 32904",
    "hours": [
      { "day": "Monday – Friday", "hours": "[Hours placeholder]" },
      { "day": "Saturday", "hours": "[Hours placeholder]" },
      { "day": "Sunday", "hours": "[Hours placeholder]" }
    ],
    "instagramUrl": "",
    "facebookUrl": ""
  }$json$::jsonb);

insert into public.content_drafts (key, data)
select key, data from cms_seed
on conflict (key) do nothing;

-- Publish the seed values themselves (never an existing draft) so the live site
-- and the dashboard start in sync.
insert into public.content_published (key, data, version)
select key, data, 1 from cms_seed
on conflict (key) do nothing;

insert into public.content_revisions (key, data, version)
select p.key, p.data, p.version
from public.content_published p
where not exists (select 1 from public.content_revisions r where r.key = p.key);

drop table cms_seed;
