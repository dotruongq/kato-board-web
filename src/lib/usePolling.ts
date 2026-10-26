import { useCallback, useEffect, useRef, useState } from 'react'

export interface PollingState<T> {
  data: T | null
  error: Error | null
  loading: boolean
  // When data was last successfully fetched, so the UI can say how old it is.
  fetchedAt: number | null
  refresh: () => void
}

/**
 * Fetch now, then every `intervalMs`. Refetches when the tab becomes visible
 * again, so a phone that was asleep doesn't keep showing hours-old numbers.
 * Keeps the last good data when a refresh fails. Changing `key` refetches.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, key = ''): PollingState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const requestId = useRef(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(() => {
    const id = ++requestId.current
    setLoading(true)
    fetcherRef
      .current()
      .then((result) => {
        if (id !== requestId.current) return
        setData(result)
        setError(null)
        setFetchedAt(Date.now())
      })
      .catch((err: Error) => {
        if (id === requestId.current) setError(err)
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const timer = window.setInterval(refresh, intervalMs)
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh, intervalMs, key])

  return { data, error, loading, fetchedAt, refresh }
}

/** Re-render every `intervalMs` so "x minutes ago" labels keep counting. */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}
