import EastIcon from '@mui/icons-material/East'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import SouthEastIcon from '@mui/icons-material/SouthEast'
import Box from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import type { MetricConfig, Tone } from '../metrics'
import { formatChange, formatMetric, useMutedColor, useToneColor } from '../metrics'
import { Sparkline } from './Sparkline'

export function ChangeChip({ metric, value }: { metric: MetricConfig; value: number | null | undefined }) {
  if (value == null) return null
  // Treat anything below the display precision as flat.
  const flat = Math.abs(value) < 0.5 * 10 ** -metric.decimals
  const Icon = flat ? EastIcon : value > 0 ? NorthEastIcon : SouthEastIcon
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.875,
        py: 0.25,
        borderRadius: 1.5,
        bgcolor: 'action.hover',
        color: 'text.primary',
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon sx={{ fontSize: 14, color: 'text.secondary' }} />
      {formatChange(metric, flat ? 0 : value)}
    </Box>
  )
}

interface Props {
  metric: MetricConfig
  value: number | null
  trend: (number | null)[]
  // Colour + word for the recent trend (see metricTone).
  tone: Tone
  toneLabel?: string
  change?: number | null
  changeLabel?: string
  stale?: boolean
  to?: string
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  trendCaption?: [string, string]
}

export function MetricCard({
  metric,
  value,
  trend,
  tone,
  toneLabel,
  change,
  changeLabel,
  stale = false,
  to,
  onClick,
  selected = false,
  compact = false,
  trendCaption,
}: Props) {
  const toneColor = useToneColor(tone)
  const muted = useMutedColor()
  const color = stale ? muted : toneColor

  const content = (
    <Stack sx={{ p: compact ? { xs: 1.5, sm: 2 } : 2.5, gap: compact ? 0.75 : 1.25, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
        <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {metric.shortLabel}
        </Typography>
        {stale && !compact && (
          <Typography
            component="span"
            sx={{
              ml: 'auto',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'error.main',
            }}
          >
            Last known
          </Typography>
        )}
        {!stale && !compact && toneLabel && (
          <Typography variant="caption" noWrap sx={{ ml: 'auto', color: 'text.secondary', fontWeight: 600 }}>
            {toneLabel}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75 }}>
        <Typography
          component="div"
          sx={{
            fontSize: compact ? { xs: 22, sm: 28 } : { xs: 40, sm: 44 },
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: stale ? 'text.secondary' : 'text.primary',
          }}
        >
          {formatMetric(metric, value, false)}
        </Typography>
        {metric.unit && (
          <Typography sx={{ color: 'text.secondary', fontSize: compact ? 13 : 16, fontWeight: 500 }}>
            {metric.unit}
          </Typography>
        )}
      </Stack>

      {!compact && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minHeight: 24 }}>
          <ChangeChip metric={metric} value={change} />
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {change != null ? changeLabel : 'Collecting data…'}
          </Typography>
        </Stack>
      )}

      <Box sx={{ mt: 'auto', pt: compact ? 0.5 : 1 }}>
        <Sparkline values={trend} color={color} height={compact ? 32 : 64} live={!stale} />
        {trendCaption && (
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', mt: 0.75, color: 'text.disabled', fontSize: 11 }}
          >
            <span>{trendCaption[0]}</span>
            <span>{trendCaption[1]}</span>
          </Stack>
        )}
      </Box>
    </Stack>
  )

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: 'hidden',
        height: '100%',
        transition: 'border-color 150ms, transform 150ms',
        borderColor: selected ? color : undefined,
        boxShadow: selected ? `inset 0 0 0 1px ${color}` : 'none',
        '&:hover': { borderColor: selected ? color : 'text.disabled' },
      }}
    >
      {to || onClick ? (
        <CardActionArea
          {...(to ? { component: RouterLink, to } : { onClick })}
          sx={{ height: '100%', alignItems: 'stretch' }}
          aria-pressed={onClick ? selected : undefined}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Paper>
  )
}
