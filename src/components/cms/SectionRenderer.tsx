import type { Section, Settings } from '@/lib/cms/documents'
import { getFaqs, getLivePromotions, getServices, type ServiceItem } from '@/lib/cms/published'
import type { PageKey, SectionType } from '@/lib/cms/sections'
import { Hero, type HeroData } from '@/components/sections/Hero'
import { TrustBar, type TrustBarData } from '@/components/sections/TrustBar'
import { PromotionsSection, type PromotionsData } from '@/components/sections/PromotionsSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { PhilosophySection, type PhilosophyData } from '@/components/sections/PhilosophySection'
import { BenefitsSection, type BenefitsData } from '@/components/sections/BenefitsSection'
import { FeaturedServices, type FeaturedServicesData } from '@/components/sections/FeaturedServices'
import { AboutSection, type AboutTeaserData } from '@/components/sections/AboutSection'
import { BookingSteps, type BookingStepsData } from '@/components/sections/BookingSteps'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA, type CtaData } from '@/components/sections/FinalCTA'
import { ContactSection, type ContactDetailsData } from '@/components/sections/ContactSection'
import { AboutStory, type AboutStoryData } from '@/components/about/AboutStory'
import { Pillars, type PillarsData } from '@/components/about/Pillars'
import { FaqList, type FaqListData } from '@/components/faq/FaqList'
import { LegalBody } from '@/components/legal/LegalBody'
import { ServiceContent, type ServiceContentData } from '@/components/services/ServiceContent'
import { ImageTextSection, type ImageTextData } from '@/components/templates/ImageTextSection'
import { BannerSection, type BannerData } from '@/components/templates/BannerSection'
import { CardsSection, type CardsData } from '@/components/templates/CardsSection'
import { GallerySection, type GalleryData } from '@/components/templates/GallerySection'
import { TestimonialsSection, type TestimonialsData } from '@/components/templates/TestimonialsSection'
import type { LinkValue } from '@/lib/cms/fields'
import { PageHeaderSection, type PageHeaderData } from './PageHeaderSection'
import { Display } from './Display'

const needsServices: SectionType[] = ['services_grid', 'featured_services', 'service_content']
const needsFaqs: SectionType[] = ['faq_preview', 'faq_list']

type Props = {
  page: PageKey
  sections: Section[]
  settings: Settings
  /** The service being shown, on service pages. */
  service?: ServiceItem
}

/** Renders a page's visible sections in order, loading only the data they need. */
export async function SectionRenderer({ page, sections, settings, service }: Props) {
  const visible = sections.filter((section) => !section.hidden)
  const types = new Set(visible.map((section) => section.type))
  const [services, faqs, promotions] = await Promise.all([
    needsServices.some((type) => types.has(type)) ? getServices() : Promise.resolve([]),
    needsFaqs.some((type) => types.has(type)) ? getFaqs() : Promise.resolve(null),
    types.has('promotions') ? getLivePromotions(page) : Promise.resolve(null),
  ])

  return (
    <>
      {visible.map((section) => {
        const data = section.data as never
        switch (section.type) {
          case 'hero':
            return <Hero key={section.id} data={data as HeroData} />
          case 'page_header':
            return <PageHeaderSection key={section.id} data={data as PageHeaderData} />
          case 'trust_bar':
            return <TrustBar key={section.id} data={data as TrustBarData} />
          case 'promotions': {
            return promotions ? <PromotionsSection key={section.id} data={data as PromotionsData} promotions={promotions} /> : null
          }
          case 'services_grid': {
            const grid = data as { eyebrow: string; title: string; intro: string; show: 'featured' | 'all'; viewAll: LinkValue; removeTopSpacing: boolean }
            return (
              <ServicesSection
                key={section.id}
                items={grid.show === 'featured' ? services.filter((item) => item.featuredOnHome) : services}
                eyebrow={grid.eyebrow || undefined}
                title={grid.title ? <Display text={grid.title} /> : undefined}
                intro={grid.intro || undefined}
                viewAllHref={grid.viewAll.href || undefined}
                viewAllLabel={grid.viewAll.label || undefined}
                className={grid.removeTopSpacing ? 'pt-0' : undefined}
              />
            )
          }
          case 'philosophy':
            return <PhilosophySection key={section.id} data={data as PhilosophyData} />
          case 'benefits':
            return <BenefitsSection key={section.id} data={data as BenefitsData} />
          case 'featured_services':
            return <FeaturedServices key={section.id} data={data as FeaturedServicesData} services={services} />
          case 'about_teaser':
            return <AboutSection key={section.id} data={data as AboutTeaserData} />
          case 'about_story':
            return <AboutStory key={section.id} data={data as AboutStoryData} />
          case 'pillars':
            return <Pillars key={section.id} data={data as PillarsData} />
          case 'booking_steps':
            return <BookingSteps key={section.id} data={data as BookingStepsData} />
          case 'faq_preview': {
            if (!faqs) return null
            const preview = data as { eyebrow: string; title: string; intro: string; source: 'home' | 'services' | 'all'; viewAll: LinkValue }
            const items = faqs.items.filter((faq) =>
              preview.source === 'home' ? faq.showOnHome : preview.source === 'services' ? faq.showOnServices : true,
            )
            if (items.length === 0) return null
            return (
              <FAQ
                key={section.id}
                items={items}
                eyebrow={preview.eyebrow || undefined}
                title={<Display text={preview.title} />}
                intro={preview.intro || undefined}
                viewAllHref={preview.viewAll.href || undefined}
                viewAllLabel={preview.viewAll.label || undefined}
              />
            )
          }
          case 'faq_list':
            return faqs ? <FaqList key={section.id} data={data as FaqListData} faqs={faqs} /> : null
          case 'contact_details':
            return <ContactSection key={section.id} data={data as ContactDetailsData} settings={settings} />
          case 'legal_body':
            return <LegalBody key={section.id} data={data as { paragraphs: string[] }} />
          case 'service_content':
            return service ? (
              <ServiceContent
                key={section.id}
                data={data as ServiceContentData}
                service={service}
                services={services}
                eyebrow={settings.tagline}
              />
            ) : null
          case 'cta':
            return <FinalCTA key={section.id} data={data as CtaData} />
          case 'image_text':
            return <ImageTextSection key={section.id} data={data as ImageTextData} />
          case 'banner':
            return <BannerSection key={section.id} data={data as BannerData} />
          case 'cards':
            return <CardsSection key={section.id} data={data as CardsData} />
          case 'gallery':
            return <GallerySection key={section.id} data={data as GalleryData} />
          case 'testimonials':
            return <TestimonialsSection key={section.id} data={data as TestimonialsData} />
        }
      })}
    </>
  )
}

