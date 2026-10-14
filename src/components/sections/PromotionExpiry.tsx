'use client'

import { useEffect, useRef } from 'react'

/**
 * Removes a promotion from the visitor's screen at its exact end time, even if
 * the cached page was generated earlier. Starts are never revealed early: an
 * upcoming promotion is not in the page until the server refreshes it.
 */
export function PromotionExpiry() {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = marker.current?.closest('[data-promotions]')
    if (!section) return
    const timers: number[] = []

    const hideExpired = () => {
      const now = Date.now()
      const articles = [...section.querySelectorAll<HTMLElement>('[data-promotion-ends]')]
      for (const article of articles) {
        if (Date.parse(article.dataset.promotionEnds ?? '') <= now) article.closest('li')?.setAttribute('hidden', '')
      }
      const items = [...section.querySelectorAll('li')]
      if (items.length > 0 && items.every((item) => item.hasAttribute('hidden'))) section.setAttribute('hidden', '')
    }

    hideExpired()
    for (const article of section.querySelectorAll<HTMLElement>('[data-promotion-ends]')) {
      const delay = Date.parse(article.dataset.promotionEnds ?? '') - Date.now()
      // setTimeout cannot schedule further than ~24.8 days ahead.
      if (delay > 0 && delay < 2_000_000_000) timers.push(window.setTimeout(hideExpired, delay + 50))
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return <span ref={marker} hidden />
}
