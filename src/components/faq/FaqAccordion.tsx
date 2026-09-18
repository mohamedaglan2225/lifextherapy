'use client'

import { useId, useState } from 'react'
import type { Faq } from '@/data/content'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span
            className={cn(
              'text-sm font-medium leading-relaxed transition-premium duration-[var(--lx-fast)]',
              open ? 'text-bronze' : 'text-charcoal',
            )}
          >
            {question}
          </span>
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center text-bronze transition-premium duration-[var(--lx-normal)]',
              open && 'rotate-45',
            )}
          >
            <Icon name="plus" size={14} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cn(
          'grid transition-premium duration-[var(--lx-normal)]',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p className={cn('pr-8 text-sm font-light leading-relaxed text-bronze-dark', open && 'pb-5')}>
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FaqAccordion({ items, className }: { items: Faq[]; className?: string }) {
  return (
    <div className={cn('border-t border-border', className)}>
      {items.map((faq) => (
        <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  )
}
