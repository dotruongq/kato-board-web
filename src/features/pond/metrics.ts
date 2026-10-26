import { useIsDark } from '../../lib/colorMode'
import type { Direction, MetricKey, RangeKey } from './types'

export interface MetricConfig {
  key: MetricKey
  label: string
  // Fits narrow cards.
  shortLabel: string
  unit: string
  decimals: number
}

export const METRICS: MetricConfig[] = [
  { key: 'ph', label: 'pH', shortLabel: 'pH', unit: '', decimals: 2 },
  { key: 'temp', label: 'Temperature', shortLabel: 'Temp', unit: '°C', decimals: 1 },
  { key: 'tds', label: 'TDS', shortLabel: 'TDS', unit: 'ppm', decimals: 0 },
]

export const METRIC_BY_KEY = Object.fromEntries(METRICS.map((m) => [m.key, m])) as Record<
  MetricKey,
  MetricConfig
>

export const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '1 month' },
]

// ---- Trend colours -------------------------------------------------------
// Green / orange / blue validated together for colour-blind separation and
// 3:1 contrast in each mode. Every tone also ships with a word label.

export type Tone = 'green' | 'orange' | 'blue' | 'neutral'

const TONE_COLORS: Record<Tone, { light: string; dark: string }> = {
  green: { light: '#079a7d', dark: '#1fae86' },
  orange: { light: '#eb6834', dark: '#d95926' },
  blue: { light: '#2a78d6', dark: '#3987e5' },
  neutral: { light: '#64748b', dark: '#8a94a6' },
}

/** Comparison lines and offline data. */
const MUTED = { light: '#a3a8b3', dark: '#5d6470' }

/** pH rising above this turns orange. */
export const PH_HIGH = 8.35

/**
 * Colour rules, driven by the API's 2-hour trend direction:
 *   pH   - falling: green · rising above PH_HIGH: orange · otherwise: blue
 *   Temp - falling: blue · rising: orange · steady: neutral
 *   TDS  - always neutral
 */
export function metricTone(
  key: MetricKey,
  direction: Direction | null | undefined,
  value: number | null | undefined,
): { tone: Tone; label: string } {
  if (direction == null) return { tone: 'neutral', label: 'Not enough data' }
  if (key === 'ph') {
    if (direction === 'down') return { tone: 'green', label: 'Falling' }
    if (direction === 'up' && value != null && value > PH_HIGH)
      return { tone: 'orange', label: `Rising above ${PH_HIGH}` }
    return { tone: 'blue', label: direction === 'up' ? 'Rising' : 'Steady' }
  }
  if (key === 'temp') {
    if (direction === 'down') return { tone: 'blue', label: 'Cooling' }
    if (direction === 'up') return { tone: 'orange', label: 'Warming' }
    return { tone: 'neutral', label: 'Steady' }
  }
  return { tone: 'neutral', label: direction === 'up' ? 'Rising' : direction === 'down' ? 'Falling' : 'Steady' }
}

export function useToneColor(tone: Tone): string {
  return TONE_COLORS[tone][useIsDark() ? 'dark' : 'light']
}

export function useMutedColor(): string {
  return MUTED[useIsDark() ? 'dark' : 'light']
}

export function formatMetric(metric: MetricConfig, value: number | null | undefined, withUnit = true): string {
  if (value == null) return '—'
  const text = value.toFixed(metric.decimals)
  return withUnit && metric.unit ? `${text} ${metric.unit}` : text
}

export function formatChange(metric: MetricConfig, value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±'
  return `${sign}${Math.abs(value).toFixed(metric.decimals)}${metric.unit ? ` ${metric.unit}` : ''}`
}

export function isMetricKey(value: string | null): value is MetricKey {
  return value === 'ph' || value === 'temp' || value === 'tds'
}

export function isRangeKey(value: string | null): value is RangeKey {
  return value === 'today' || value === '7d' || value === '30d'
}
