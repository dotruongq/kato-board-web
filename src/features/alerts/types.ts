// Mirrors src/features/alerts/schemas.py in pond-api.

export interface Limit {
  enabled: boolean
  min: number | null
  max: number | null
}

export interface AlertSettings {
  ph: Limit
  temp: Limit // °C
  tds: Limit
  offline: boolean
  weather: boolean
}

export type Severity = 'critical' | 'warning' | 'info'

export interface Notice {
  key: string
  title: string
  body: string
  severity: Severity
  url: string
}

export interface SentNotice extends Notice {
  sent_at: string
  delivered: number
}

export interface CheckResult {
  sent: Notice[]
  delivered: number
}
