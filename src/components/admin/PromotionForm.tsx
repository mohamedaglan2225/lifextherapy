'use client'

import { savePromotion } from '@/app/admin/actions/promotions'
import type { Promotion } from '@/lib/cms/schema'
import { Panel, TextAreaField, TextField } from './fields'
import { FormFooter } from './FormFooter'
import { ImageField } from './ImageField'
import { useCmsForm } from './useCmsForm'

export function PromotionForm({
  promotion,
  imagePreviewUrl,
}: {
  promotion: Promotion | null
  imagePreviewUrl: string | null
}) {
  const { state, onSubmit, pending, uploading, setUploading } = useCmsForm(savePromotion)
  const errors = state.fieldErrors

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="id" value={promotion?.id ?? ''} />
      <Panel title="Promotion">
        <TextField label="Title" name="title" defaultValue={promotion?.title} maxLength={120} required error={errors.title} />
        <TextAreaField
          label="Description"
          name="description"
          defaultValue={promotion?.description}
          rows={4}
          maxLength={600}
          error={errors.description}
        />
        <TextField
          label="Order"
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={promotion?.sortOrder ?? 0}
          error={errors.sortOrder}
          hint="Lower numbers appear first."
          className="max-w-32"
        />
      </Panel>

      <Panel title="Image" description="Optional.">
        <ImageField
          name="imagePath"
          label="Image"
          initialPath={promotion?.imagePath ?? ''}
          initialPreviewUrl={imagePreviewUrl}
          optional
          error={errors.imagePath}
          onUploadingChange={setUploading}
        />
        <TextField
          label="Image description"
          name="imageAlt"
          defaultValue={promotion?.imageAlt}
          maxLength={200}
          error={errors.imageAlt}
          hint="Required when there is an image."
        />
      </Panel>

      <Panel title="Button" description="Optional. Leave the link empty for a promotion without a button.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Link"
            name="linkUrl"
            defaultValue={promotion?.linkUrl ?? ''}
            maxLength={500}
            error={errors.linkUrl}
            hint="A page on this site such as /services, or a full https:// address (for example a Vagaro booking link)."
          />
          <TextField
            label="Button text"
            name="linkLabel"
            defaultValue={promotion?.linkLabel}
            maxLength={40}
            placeholder="Learn More"
            error={errors.linkLabel}
          />
        </div>
      </Panel>

      <FormFooter state={state} pending={pending} uploading={uploading} />
    </form>
  )
}
