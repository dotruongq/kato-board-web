import { useEffect } from 'react'

const VERSION_CHECK_MS = 5 * 60_000

/** Keep the display awake while the page is visible (re-acquired after tab switches). */
export function useWakeLock(): void {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let active = true
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        // Denied (e.g. battery saver); the dashboard still works, the screen may just sleep.
      }
    }
    const onVisible = () => {
      if (active && document.visibilityState === 'visible') void acquire()
    }
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [])
}

/** In production, reload the page when a newer build has been deployed. */
export function useReloadOnNewVersion(): void {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
        const { build } = (await res.json()) as { build?: string }
        if (build && build !== __BUILD_ID__) window.location.reload()
      } catch {
        // Offline or mid-deploy; try again next time.
      }
    }
    const timer = window.setInterval(check, VERSION_CHECK_MS)
    return () => window.clearInterval(timer)
  }, [])
}
