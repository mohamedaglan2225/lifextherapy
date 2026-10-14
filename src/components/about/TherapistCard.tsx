import type { ImageValue } from '@/lib/cms/fields'
import { CmsImage } from '@/components/cms/CmsImage'
import { cn } from '@/lib/cn'

/** Therapist portrait, or the placeholder card until a portrait is added. */
export function TherapistCard({
  portrait,
  placeholder,
  name,
  className,
}: {
  portrait: ImageValue
  placeholder: string
  name: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      {portrait.src ? (
        <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-border">
          <CmsImage
            src={portrait.src}
            alt={portrait.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 45vw, 100vw"
            data-settle
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-sm bg-border">
          <div className="p-8 text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-bronze/30 bg-border"
            />
            {placeholder && <p className="text-sm font-light text-bronze-dark">{placeholder}</p>}
            {name && <p className="mt-1 text-xs text-bronze">{name}</p>}
          </div>
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-sm border border-bronze lg:block"
      />
    </div>
  )
}
