import Link from 'next/link'
import { businessPlaceholders, navLinks, siteConfig } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="bg-charcoal pt-16 pb-8">
      <Container>
        <div className="mb-16 grid gap-12 md:grid-cols-3">
          <div>
            <Logo className="mb-5 h-12" sizes="48px" />
            <p className="max-w-xs text-xs font-light leading-relaxed text-bronze-dark">
              Personalized massage therapy and bodywork designed around your body, comfort, and goals.
            </p>
          </div>

          <div>
            <h2 className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
              Navigate
            </h2>
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block py-1 text-sm font-light text-border transition-premium duration-[var(--lx-fast)] hover:text-offwhite"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
              Book a Session
            </h2>
            <BookingLink variant="outlineBronze" size="compact" className="mb-8">
              Book Now
            </BookingLink>

            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
              Follow
            </h2>
            <ul className="flex gap-4">
              {businessPlaceholders.social.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={`${social.label} (link placeholder)`}
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-charcoal-soft text-bronze-dark transition-premium duration-[var(--lx-fast)] hover:border-bronze hover:text-bronze"
                  >
                    <Icon name={social.icon} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-charcoal-soft pt-8 sm:flex-row">
          <p className="text-xs font-light text-bronze-dark">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {businessPlaceholders.legal.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-block py-1 text-xs font-light text-bronze-dark transition-premium duration-[var(--lx-fast)] hover:text-border"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
