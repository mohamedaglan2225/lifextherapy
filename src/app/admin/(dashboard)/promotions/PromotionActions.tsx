import { deletePromotion, hidePromotion, publishPromotion } from '@/app/admin/actions/promotions'
import { ConfirmButton } from '@/components/admin/ConfirmButton'
import { dangerButton, primaryButton, secondaryButton } from '@/components/admin/FormFooter'
import type { PromotionStatus } from '@/lib/cms/drafts'

/** Publish / hide / delete controls for one promotion. Each is its own Server Action form. */
export function PromotionActions({ id, title, status }: { id: string; title: string; status: PromotionStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'published' && (
        <form action={publishPromotion.bind(null, id)}>
          <ConfirmButton className={primaryButton}>
            {status === 'changed' ? 'Publish changes' : 'Publish'}
            <span className="sr-only"> {title}</span>
          </ConfirmButton>
        </form>
      )}
      {status !== 'draft' && (
        <form action={hidePromotion.bind(null, id)}>
          <ConfirmButton className={secondaryButton} confirmMessage={`Hide “${title}” from the website?`}>
            Hide<span className="sr-only"> {title}</span>
          </ConfirmButton>
        </form>
      )}
      <form action={deletePromotion.bind(null, id)}>
        <ConfirmButton className={dangerButton} confirmMessage={`Delete “${title}” permanently? This cannot be undone.`}>
          Delete<span className="sr-only"> {title}</span>
        </ConfirmButton>
      </form>
    </div>
  )
}
