export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`
  const d = Math.floor(h / 24)
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`
}

export function formatAgo(iso: string, now: number): string {
  const seconds = (now - new Date(iso).getTime()) / 1000
  return seconds < 30 ? 'just now' : `${formatDuration(seconds)} ago`
}

const dateTime = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDateTime(iso: string | Date): string {
  return dateTime.format(typeof iso === 'string' ? new Date(iso) : iso)
}

/** Coarse "6h ago" style label for chart captions. */
export function formatRoughAgo(iso: string, now: number): string {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  return `${Math.round(minutes / 60)}h ago`
}
