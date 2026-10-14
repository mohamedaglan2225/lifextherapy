/**
 * Promotion schedules are entered in the business's time zone and stored as
 * UTC instants, so daylight-saving changes are handled correctly.
 */

function zonedParts(ms: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ms))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') }
}

/** Offset of `timeZone` from UTC at an instant, in milliseconds. */
function offsetAt(ms: number, timeZone: string) {
  const p = zonedParts(ms, timeZone)
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000
}

/** `2026-11-01T09:00` in `timeZone` → ISO UTC string. Empty in, empty out. */
export function zonedInputToUtc(local: string, timeZone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!match) return ''
  const [, year, month, day, hour, minute] = match.map(Number)
  const wall = Date.UTC(year, month - 1, day, hour, minute)
  let instant = wall - offsetAt(wall, timeZone)
  instant = wall - offsetAt(instant, timeZone)
  return new Date(instant).toISOString()
}

/** ISO UTC string → `YYYY-MM-DDTHH:mm` in `timeZone`, for datetime-local inputs. */
export function utcToZonedInput(iso: string, timeZone: string) {
  if (!iso) return ''
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ''
  const p = zonedParts(ms, timeZone)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}
