'use client'

import { saveHomeHero } from '@/app/admin/actions/content'
import type { HomeHero } from '@/lib/cms/schema'
import { Panel, TextAreaField, TextField } from './fields'
import { FormFooter } from './FormFooter'
import { ImageField } from './ImageField'
import { useCmsForm } from './useCmsForm'

export function HeroForm({ hero, imagePreviewUrl }: { hero: HomeHero; imagePreviewUrl: string | null }) {
  const { state, onSubmit, pending, uploading, setUploading } = useCmsForm(saveHomeHero)
  const errors = state.fieldErrors

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Panel title="Text">
        <TextField label="Eyebrow" name="eyebrow" defaultValue={hero.eyebrow} maxLength={80} required error={errors.eyebrow} hint="The small line above the headline." />
        <TextAreaField
          label="Headline"
          name="headline"
          defaultValue={hero.headline}
          rows={3}
          required
          error={errors.headline}
          hint="Up to three lines. Each line break in this box becomes a line break on the site."
        />
        <TextField
          label="Final headline line (italic)"
          name="headlineEmphasis"
          defaultValue={hero.headlineEmphasis}
          maxLength={60}
          error={errors.headlineEmphasis}
          hint="Optional. Shown in italics under the headline."
        />
        <TextAreaField label="Intro text" name="body" defaultValue={hero.body} rows={3} maxLength={300} required error={errors.body} />
      </Panel>

      <Panel title="Background image">
        <ImageField
          name="image"
          label="Image"
          initialPath={hero.image}
          initialPreviewUrl={imagePreviewUrl}
          error={errors.image}
          onUploadingChange={setUploading}
        />
        <TextField
          label="Image description"
          name="imageAlt"
          defaultValue={hero.imageAlt}
          maxLength={160}
          required
          error={errors.imageAlt}
          hint="Describes the photo for visitors using screen readers and for search engines."
        />
      </Panel>

      <Panel title="Buttons">
        <TextField
          label="Booking button text"
          name="primaryLabel"
          defaultValue={hero.primaryLabel}
          maxLength={40}
          required
          error={errors.primaryLabel}
          hint="This button always opens your Vagaro booking page."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Second button text" name="secondaryLabel" defaultValue={hero.secondaryLabel} maxLength={40} required error={errors.secondaryLabel} />
          <TextField
            label="Second button link"
            name="secondaryHref"
            defaultValue={hero.secondaryHref}
            maxLength={500}
            required
            error={errors.secondaryHref}
            hint="A page on this site such as /services, or a full https:// address."
          />
        </div>
      </Panel>

      <FormFooter state={state} pending={pending} uploading={uploading} />
    </form>
  )
}
