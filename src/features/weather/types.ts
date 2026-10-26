// Mirrors src/features/weather/schemas.py in pond-api.

export type Condition = 'clear' | 'partly_cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm'

export interface Weather {
  location: string
  temperature: number
  unit: 'F' | 'C'
  condition: Condition
  description: string
  is_day: boolean
  wind_speed: number
  wind_gusts: number
  wind_unit: 'mph' | 'km/h'
  windy: boolean
  timezone: string
  observed_at: string
}

export type AlertKind = 'rain_now' | 'rain' | 'cold' | 'freeze' | 'heat' | 'swing_up' | 'swing_down'
export type Severity = 'critical' | 'warning' | 'info'

export interface WeatherAlert {
  kind: AlertKind
  severity: Severity
  title: string
  detail: string
  day: string
}

export interface ForecastDay {
  day: string
  condition: Condition
  high: number
  low: number
  precip_probability: number | null
  precip_sum: number
}

export interface Outlook {
  location: string
  unit: 'F' | 'C'
  precip_unit: 'in' | 'mm'
  alerts: WeatherAlert[]
  forecast: ForecastDay[]
}
