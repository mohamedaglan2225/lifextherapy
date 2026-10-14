import content from './defaults/site-content.json'
import type { FaqsDoc, PageDoc, ServiceDoc, Settings } from './documents'
import type { PageKey } from './sections'

/**
 * The content the site shipped with, generated from the original pages.
 * Used when the CMS is not configured, or for a document that has never been
 * published. `supabase/seed.sql` is generated from the same file
 * (`npm run cms:seed`), so the database starts with identical content.
 */
export const defaultContent = content as unknown as {
  settings: Settings
  pages: Record<PageKey, PageDoc>
  services: Array<{ id: string; data: ServiceDoc }>
  faqs: FaqsDoc
}
