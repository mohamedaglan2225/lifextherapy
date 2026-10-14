export function formatPrice(price: number): string {
  return `$${price}`
}

export function startingPrice(service: { sessions: Array<{ price: number }> }): number {
  return Math.min(...service.sessions.map((session) => session.price))
}

/** `(321) 467-4569` → `tel:+13214674569`; 10-digit numbers get the US country code. */
export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `tel:+1${digits}` : `tel:+${digits}`
}
