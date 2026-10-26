// Mirrors src/features/pond/schemas.py in pond-api.

export type FreshnessStatus = 'live' | 'delayed' | 'offline'
export type RangeKey = 'today' | '7d' | '30d'
export type MetricKey = 'ph' | 'temp' | 'tds'
export type Direction = 'up' | 'down' | 'flat'
// Direction over the last 2h; null = too little data.
export type Directions = Record<MetricKey, Direction | null>

export interface Freshness {
  status: FreshnessStatus
  message: string | null
  last_synced_at: string
  sync_age_seconds: number
  last_reading_at: string | null
  reading_age_seconds: number | null
}

export type Reading = Record<MetricKey, number | null>

export interface Device {
  device_id: string
  device_name: string
  latest: Reading
  freshness: Freshness
  // Last 24h in 30-min buckets; null = no data in that bucket.
  trend: SeriesPoint[]
  // latest minus the oldest trend bucket, and that bucket's time.
  change: Reading | null
  change_since: string | null
  direction: Directions | null
}

export interface DevicesResponse {
  generated_at: string
  devices: Device[]
}

export interface SeriesPoint extends Reading {
  t: string
  count: number
}

export interface Gap {
  start: string
  end: string
  seconds: number
}

export interface MetricStats {
  min: number | null
  max: number | null
  avg: number | null
}

export interface SeriesResponse {
  device_id: string
  device_name: string
  range: RangeKey
  tz: string
  start: string
  end: string
  // Set when the range was trimmed to when the device first reported.
  data_since: string | null
  bucket_seconds: number
  points: SeriesPoint[]
  gaps: Gap[]
  stats: Record<MetricKey, MetricStats>
  // Previous period, aligned index-by-index with `points`.
  previous: Reading[]
  previous_stats: Record<MetricKey, MetricStats>
  previous_label: string
  latest: Reading
  direction: Directions | null
  freshness: Freshness
}
