import { businessPlaceholders } from '@/config/site'
import { cn } from '@/lib/cn'

/**
 * Placeholder for the therapist portrait and credentials. No real name,
 * qualification or photograph has been supplied yet.
 */
export function TherapistCard({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="flex aspect-3/4 items-center justify-center overflow-hidden rounded-sm bg-border">
        <div className="p-8 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-bronze/30 bg-border"
          />
          <p className="text-sm font-light text-bronze-dark">[Professional photo placeholder]</p>
          <p className="mt-1 text-xs text-bronze">{businessPlaceholders.therapistName}</p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-sm border border-bronze lg:block"
      />
    </div>
  )
}
