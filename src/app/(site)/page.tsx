import type { Metadata } from 'next'
import { homeServices } from '@/data/services'
import { homeFaqs } from '@/data/content'
import { routes } from '@/config/site'
import { getHomeHero, getPromotions } from '@/lib/cms/published'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { PromotionsSection } from '@/components/sections/PromotionsSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { PhilosophySection } from '@/components/sections/PhilosophySection'
import { BenefitsSection } from '@/components/sections/BenefitsSection'
import { FeaturedServices } from '@/components/sections/FeaturedServices'
import { AboutSection } from '@/components/sections/AboutSection'
import { BookingSteps } from '@/components/sections/BookingSteps'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [hero, promotions] = await Promise.all([getHomeHero(), getPromotions()])

  return (
    <>
      <Hero hero={hero} />
      <TrustBar />
      <PromotionsSection promotions={promotions} />
      <ServicesSection
        items={homeServices}
        eyebrow="Our Services"
        title="Massage & Bodywork Services"
        intro="Choose the session that best fits your body, goals, and schedule."
        viewAllHref={routes.services}
      />
      <PhilosophySection />
      <BenefitsSection />
      <FeaturedServices />
      <AboutSection />
      <BookingSteps />
      <FAQ items={homeFaqs} viewAllHref={routes.faq} />
      <FinalCTA />
    </>
  )
}
