import { useTheme } from '@mui/material/styles'
import { chartsAxisHighlightClasses } from '@mui/x-charts/ChartsAxisHighlight'
import { chartsGridClasses } from '@mui/x-charts/ChartsGrid'
import { LineChart, lineClasses } from '@mui/x-charts/LineChart'
import { useDrawingArea, useXScale } from '@mui/x-charts/hooks'
import { useId, useMemo } from 'react'
import type { MetricConfig } from '../metrics'
import { useIsDark } from '../../../lib/colorMode'
import { formatMetric, useMutedColor } from '../metrics'
import type { Gap, Reading, SeriesPoint } from '../types'

/** Hatched band over time ranges where the sync bot sent nothing. */
function GapShading({ gaps }: { gaps: Gap[] }) {
  const theme = useTheme()
  const patternId = useId()
  const xScale = useXScale<'time'>()
  const { left, top, width, height } = useDrawingArea()
  const clamp = (x: number) => Math.min(left + width, Math.max(left, x))
  const color = theme.vars?.palette.error.main ?? theme.palette.error.main

  return (
    <g>
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: color, strokeWidth: 1.5, opacity: 0.35 }} />
        </pattern>
      </defs>
      {gaps.map((gap) => {
        const x1 = clamp(xScale(new Date(gap.start)))
        const x2 = clamp(xScale(new Date(gap.end)))
        const w = Math.max(2, x2 - x1)
        return (
          <g key={gap.start}>
            <rect x={x1} y={top} width={w} height={height} style={{ fill: color, opacity: 0.06 }} />
            <rect x={x1} y={top} width={w} height={height} fill={`url(#${patternId})`} />
            {w >= 52 && (
              <text
                x={x1 + w / 2}
                y={top + 14}
                textAnchor="middle"
                style={{
                  fill: theme.vars?.palette.text.secondary,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                No data
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

type TickScale = 'hours' | 'days' | 'weeks'

const TICK_FORMAT: Record<TickScale, Intl.DateTimeFormatOptions> = {
  hours: { hour: 'numeric' },
  days: { weekday: 'short' },
  weeks: { month: 'short', day: 'numeric' },
}

/** Tick spacing follows the time actually shown, which can be shorter than the range for new devices. */
function tickScale(start: Date, end: Date): TickScale {
  const days = (end.getTime() - start.getTime()) / 86_400_000
  return days <= 1.5 ? 'hours' : days <= 10 ? 'days' : 'weeks'
}

/** Tick positions on local-time boundaries so labels never repeat. */
function buildTicks(scale: TickScale, start: Date, end: Date): Date[] {
  const ticks: Date[] = []
  const d = new Date(start)
  if (scale === 'hours') {
    const everyHours = (end.getTime() - start.getTime()) / 3_600_000 <= 8 ? 1 : 3
    d.setMinutes(0, 0, 0)
    for (; d <= end; d.setHours(d.getHours() + 1)) {
      if (d >= start && d.getHours() % everyHours === 0) ticks.push(new Date(d))
    }
    return ticks
  }
  d.setHours(0, 0, 0, 0)
  if (d < start) d.setDate(d.getDate() + 1)
  const everyDays = scale === 'days' ? 1 : 5
  for (; d <= end; d.setDate(d.getDate() + everyDays)) ticks.push(new Date(d))
  return ticks
}

const TOOLTIP_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

interface Props {
  metric: MetricConfig
  // Line colour, from the metric's trend tone.
  color: string
  points: SeriesPoint[]
  previous: Reading[]
  previousLabel: string
  currentLabel: string
  gaps: Gap[]
  start: string
  end: string
  height?: number
}

export function MetricChart({
  metric,
  color,
  points,
  previous,
  previousLabel,
  currentLabel,
  gaps,
  start,
  end,
  height = 320,
}: Props) {
  const dark = useIsDark()
  const gradientId = useId().replace(/:/g, '')
  const muted = useMutedColor()

  const xData = useMemo(() => points.map((p) => new Date(p.t)), [points])
  const yData = useMemo(() => points.map((p) => p[metric.key]), [points, metric.key])
  const prevData = useMemo(() => previous.map((p) => p[metric.key]), [previous, metric.key])
  const scale = tickScale(new Date(start), new Date(end))
  const tickFmt = useMemo(() => new Intl.DateTimeFormat(undefined, TICK_FORMAT[scale]), [scale])
  const tooltipFmt = useMemo(() => new Intl.DateTimeFormat(undefined, TOOLTIP_FORMAT), [])
  const ticks = useMemo(() => buildTicks(scale, new Date(start), new Date(end)), [scale, start, end])
  const format = (v: number | null) => (v == null ? 'No data' : formatMetric(metric, v))

  return (
    <LineChart
      height={height}
      hideLegend
      skipAnimation
      grid={{ horizontal: true }}
      margin={{ left: 0, right: 8, top: 12, bottom: 0 }}
      xAxis={[
        {
          data: xData,
          scaleType: 'time',
          min: new Date(start),
          max: new Date(end),
          tickInterval: ticks,
          disableLine: true,
          disableTicks: true,
          valueFormatter: (value: Date, ctx) =>
            ctx.location === 'tick' ? tickFmt.format(value) : tooltipFmt.format(value),
        },
      ]}
      yAxis={[{ width: 48, domainLimit: 'nice', disableLine: true, disableTicks: true }]}
      series={[
        {
          id: 'previous',
          data: prevData,
          label: previousLabel,
          color: muted,
          curve: 'monotoneX',
          showMark: false,
          connectNulls: false,
          valueFormatter: format,
        },
        {
          id: 'current',
          data: yData,
          label: currentLabel,
          color,
          curve: 'monotoneX',
          showMark: false,
          area: true,
          // Fill down to the bottom of the plot instead of forcing the axis to include 0.
          baseline: 'min',
          // Never draw across missing data: a break means the bot was down.
          connectNulls: false,
          valueFormatter: format,
        },
      ]}
      sx={(theme) => ({
        [`& .${lineClasses.area}`]: { fill: `url(#${gradientId}) !important` },
        [`& .${lineClasses.line}`]: { strokeWidth: 2.25, strokeLinecap: 'round' },
        [`& .${lineClasses.line}[data-series-id="previous"]`]: { strokeWidth: 1.5, strokeDasharray: '4 5' },
        [`& .${lineClasses.highlight}`]: {
          fill: `${theme.vars!.palette.background.paper} !important`,
          strokeWidth: 3,
        },
        [`& .${chartsAxisHighlightClasses.root}`]: {
          stroke: `${theme.vars!.palette.text.secondary} !important`,
          strokeDasharray: '3 4',
          strokeOpacity: 0.7,
        },
        [`& .${chartsGridClasses.line}`]: { stroke: theme.vars!.palette.divider, strokeDasharray: '2 6' },
        '& .MuiChartsAxis-tickLabel': { fill: `${theme.vars!.palette.text.secondary} !important`, fontSize: 12 },
      })}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.45 : 0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <GapShading gaps={gaps} />
    </LineChart>
  )
}
