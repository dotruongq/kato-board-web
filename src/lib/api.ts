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
  return request<T>('GET', `${path}${params ? `?${new URLSearchParams(params)}` : ''}`)
}

/** POST/PUT with a JSON body. Returns the parsed body, or undefined for 204 responses. */
export async function apiSend<T = void>(method: 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
  return request<T>(method, path, body)
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  const send = async (forceRefresh: boolean) => {
    try {
      return await fetch(url, {
        method,
        headers: {
          ...(await authHeader(forceRefresh)),
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError(0, 'Cannot reach the API')
    }
  }

  let res = await send(false)
  // A token can expire between checks (e.g. a laptop waking from sleep): renew once and retry.
  if (res.status === 401 && auth?.currentUser) res = await send(true)
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    const detail = Array.isArray(errorBody?.detail) ? errorBody.detail[0]?.msg : errorBody?.detail
    throw new ApiError(res.status, detail ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
