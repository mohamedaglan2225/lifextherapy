import { businessPlaceholders } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'

const details: Array<{ label: string; value: string; icon: IconName }> = [
  { label: 'Phone', value: businessPlaceholders.phone, icon: 'phone' },
  { label: 'Email', value: businessPlaceholders.email, icon: 'mail' },
  { label: 'Address', value: businessPlaceholders.address, icon: 'pin' },
]

const actionClasses =
  'flex-1 rounded-sm border border-charcoal py-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-charcoal transition-premium duration-[var(--lx-fast)] hover:bg-charcoal hover:text-ivory motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]'

export function ContactSection() {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <Reveal>
            <Eyebrow className="mb-6">Get in Touch</Eyebrow>
            <h2 className="mb-6 font-serif text-4xl leading-tight text-charcoal lg:text-5xl">
              Contact &amp;
              <br />
              Location
            </h2>
            <p className="mb-10 max-w-sm text-sm font-light leading-relaxed text-bronze-dark">
              Questions, or prefer to reach out before booking? We&rsquo;re happy to help.
            </p>

            <ul className="flex flex-col gap-6">
              {details.map((detail) => (
                <li key={detail.label} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-bronze">
                    <Icon name={detail.icon} size={16} />
                  </span>
                  <span>
                    <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-[0.15em] text-bronze">
                      {detail.label}
                    </span>
                    <span className="block text-sm font-light text-charcoal">{detail.value}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.15em] text-bronze">
                Follow
              </h3>
              <ul className="flex gap-4">
                {businessPlaceholders.social.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={`${social.label} (link placeholder)`}
                      className="flex h-11 w-11 items-center justify-center rounded-sm border border-border text-bronze transition-premium duration-[var(--lx-fast)] hover:border-bronze hover:text-bronze-dark"
                    >
                      <Icon name={social.icon} size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={90} className="flex flex-col gap-6">
            <div className="rounded-sm border border-border bg-offwhite p-8">
              <h3 className="mb-6 font-serif text-xl text-charcoal">Business Hours</h3>
              <dl className="flex flex-col gap-3">
                {businessPlaceholders.hours.map((entry) => (
                  <div
                    key={entry.day}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm font-light text-bronze-dark">{entry.day}</dt>
                    <dd className="text-sm font-medium text-charcoal">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex h-48 items-center justify-center rounded-sm bg-border">
              <p className="text-sm font-light text-bronze-dark">[Map placeholder]</p>
            </div>

            <div className="flex gap-3">
              {/* These become live links as soon as real contact details are configured. */}
              <a href={businessPlaceholders.phoneHref || undefined} className={actionClasses}>
                Call
              </a>
              <a href={businessPlaceholders.emailHref || undefined} className={actionClasses}>
                Email
              </a>
              <BookingLink size="block" className="flex-1">
                Book Online
              </BookingLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
