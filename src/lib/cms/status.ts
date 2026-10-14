import { isPromotionActive, type PromotionDoc, type ServiceDoc } from './documents'
import { hasUnpublishedChanges, type DocState } from './repo'

export type Status = { tone: 'live' | 'changed' | 'draft' | 'scheduled' | 'ended' | 'archived'; label: string }

export function docStatus(state: DocState): Status {
  if (!state.published) return { tone: 'draft', label: 'Not published' }
  if (state.kind === 'service' && (state.published.data as ServiceDoc).status === 'archived') {
    return hasUnpublishedChanges(state) ? { tone: 'changed', label: 'Archived · unpublished changes' } : { tone: 'archived', label: 'Archived' }
  }
  if (state.kind === 'promotion') {
    const live = state.published.data as PromotionDoc
    const changed = hasUnpublishedChanges(state) ? ' · unpublished changes' : ''
    if (live.startsAt && Date.parse(live.startsAt) > Date.now()) return { tone: 'scheduled', label: `Scheduled${changed}` }
    if (!isPromotionActive(live)) return { tone: 'ended', label: `Ended${changed}` }
    return { tone: changed ? 'changed' : 'live', label: `Live${changed}` }
  }
  return hasUnpublishedChanges(state) ? { tone: 'changed', label: 'Unpublished changes' } : { tone: 'live', label: 'Published' }
}

/** Published promotions whose start time is still in the future. */
export function upcomingPromotions(states: DocState[]) {
  const now = Date.now()
  return states.filter((state) => {
    const promotion = state.published?.data as PromotionDoc | undefined
    return state.kind === 'promotion' && Boolean(promotion?.startsAt) && Date.parse(promotion!.startsAt) > now
  })
}
