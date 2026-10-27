import { auth } from './firebase'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function authHeader(forceRefresh = false): Promise<Record<string, string>> {
  const user = auth?.currentUser
  if (!user) return {}
  // Firebase returns the cached token and renews it shortly before it expires.
  return { Authorization: `Bearer ${await user.getIdToken(forceRefresh)}` }
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = `${BASE_URL}${path}${params ? `?${new URLSearchParams(params)}` : ''}`
  const send = async (forceRefresh: boolean) => {
    try {
      return await fetch(url, { headers: await authHeader(forceRefresh) })
    } catch {
      throw new ApiError(0, 'Cannot reach the API')
    }
  }

  let res = await send(false)
  // A token can expire between checks (e.g. a laptop waking from sleep): renew once and retry.
  if (res.status === 401 && auth?.currentUser) res = await send(true)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.detail ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
