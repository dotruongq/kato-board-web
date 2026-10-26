const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params)}` : ''
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}${query}`)
  } catch {
    throw new ApiError(0, 'Cannot reach the API')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.detail ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
