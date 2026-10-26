import Box from '@mui/material/Box'
import { useId, useMemo } from 'react'

const W = 200
const PAD_Y = 0.12
const MAX_POINTS = 48

/** Average into at most MAX_POINTS buckets so long ranges stay readable at sparkline size. */
function downsample(values: (number | null)[]): (number | null)[] {
  if (values.length <= MAX_POINTS) return values
  const size = values.length / MAX_POINTS
  return Array.from({ length: MAX_POINTS }, (_, i) => {
    const chunk = values
      .slice(Math.floor(i * size), Math.floor((i + 1) * size))
      .filter((v): v is number => v != null)
    return chunk.length ? chunk.reduce((a, b) => a + b, 0) / chunk.length : null
  })
}

interface Props {
  values: (number | null)[]
  color: string
  height?: number
  // Draw the end dot as "live" (filled, pulsing) or as a hollow last-known marker.
  live?: boolean
}

type Pt = { x: number; y: number }

/** Smooth path through points using midpoints as quadratic control anchors. */
function smoothPath(pts: Pt[]): string {
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}h0.01`
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q${pts[i].x},${pts[i].y} ${mx},${my}`
  }
  const last = pts[pts.length - 1]
  return `${d} L${last.x},${last.y}`
}

/**
 * Tiny trend line. Missing buckets split the line into separate segments, so an
 * outage shows as a visible break rather than a straight bridge.
 */
export function Sparkline({ values: raw, color, height = 56, live = true }: Props) {
  const gradientId = useId()
  const values = useMemo(() => downsample(raw), [raw])

  const { segments, lastPt, lastIsCurrent } = useMemo(() => {
    const nums = values.filter((v): v is number => v != null)
    if (nums.length === 0) return { segments: [] as Pt[][], lastPt: null, lastIsCurrent: false }
    let lo = Math.min(...nums)
    let hi = Math.max(...nums)
    if (hi - lo < 1e-9) {
      lo -= 1
      hi += 1
    }
    const span = hi - lo
    const toY = (v: number) => height - (PAD_Y * height + ((v - lo) / span) * height * (1 - 2 * PAD_Y))
    const step = values.length > 1 ? W / (values.length - 1) : 0

    const segs: Pt[][] = []
    let current: Pt[] = []
    let last: Pt | null = null
    let lastIndex = -1
    values.forEach((v, i) => {
      if (v == null) {
        if (current.length) segs.push(current)
        current = []
        return
      }
      last = { x: i * step, y: toY(v) }
      lastIndex = i
      current.push(last)
    })
    if (current.length) segs.push(current)
    // The newest bucket may be partially filled; one empty trailing bucket still counts as current.
    return { segments: segs, lastPt: last as Pt | null, lastIsCurrent: lastIndex >= values.length - 2 }
  }, [values, height])

  const showLive = live && lastIsCurrent

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {segments.map((seg, i) => {
          const line = smoothPath(seg)
          const area = `${line} L${seg[seg.length - 1].x},${height} L${seg[0].x},${height} Z`
          return (
            <g key={i}>
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>
      {lastPt && (
        <Box
          sx={{
            position: 'absolute',
            left: `${(lastPt.x / W) * 100}%`,
            top: lastPt.y,
            width: 10,
            height: 10,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: showLive ? color : 'background.paper',
            border: 2,
            borderColor: showLive ? 'background.paper' : color,
            boxShadow: showLive ? `0 0 0 2px ${color}` : 'none',
            '&::after': showLive
              ? {
                  content: '""',
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  animation: 'sparkPing 2s ease-out infinite',
                }
              : undefined,
            '@keyframes sparkPing': {
              '0%': { opacity: 0.6, transform: 'scale(0.6)' },
              '100%': { opacity: 0, transform: 'scale(1.6)' },
            },
          }}
        />
      )}
    </Box>
  )
}
