import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../lib/api'
import { formatAgo, formatDateTime, formatDuration } from '../../../lib/format'
import { useNow, usePolling } from '../../../lib/usePolling'
import { fetchReadings } from '../api'
import { FreshnessAlert, FreshnessChip } from '../components/Freshness'
import { ChangeChip, MetricCard } from '../components/MetricCard'
import { MetricChart } from '../components/MetricChart'
import {
  METRICS,
  METRIC_BY_KEY,
  RANGES,
  formatMetric,
  isMetricKey,
  isRangeKey,
  metricTone,
  useMutedColor,
  useToneColor,
} from '../metrics'
import type { Gap } from '../types'

const REFRESH_MS = 120_000

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Box
        component="span"
        sx={{
          width: 18,
          borderTop: dashed ? `2px dashed ${color}` : `2.5px solid ${color}`,
          borderRadius: 1,
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: 17, fontVariantNumeric: 'tabular-nums' }} noWrap>
        {value}
      </Typography>
    </Box>
  )
}

export default function DeviceDetailPage() {
  const { deviceId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const metricParam = params.get('metric')
  const rangeParam = params.get('range')
  const metric = METRIC_BY_KEY[isMetricKey(metricParam) ? metricParam : 'ph']
  const range = isRangeKey(rangeParam) ? rangeParam : 'today'
  const now = useNow()

  const { data, error, loading } = usePolling(
    () => fetchReadings(deviceId, range),
    REFRESH_MS,
    `${deviceId}:${range}`,
  )
  // Ignore data from the previous range while the new one loads.
  const series = data && data.range === range ? data : null
  const stale = series?.freshness.status === 'offline'
  const { tone, label: toneLabel } = metricTone(
    metric.key,
    series?.direction?.[metric.key],
    series?.latest[metric.key],
  )
  const toneColor = useToneColor(tone)
  const muted = useMutedColor()
  const lineColor = stale ? muted : toneColor

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next, { replace: true })
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Stack spacing={2}>
        <BackLink />
        <Alert severity="warning">Device "{deviceId}" was not found.</Alert>
      </Stack>
    )
  }

  const stats = series?.stats[metric.key]
  const prevStats = series?.previous_stats[metric.key]
  const avgChange = stats?.avg != null && prevStats?.avg != null ? stats.avg - prevStats.avg : null
  const hasData = series?.points.some((p) => p[metric.key] != null) ?? false
  const rangeLabel = RANGES.find((r) => r.key === range)!.label
  const currentLabel = range === 'today' ? 'Today' : `Last ${rangeLabel.toLowerCase()}`

  return (
    <Stack spacing={3}>
      <Box>
        <BackLink />
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
          <Typography variant="h4" component="h1">
            {data?.device_name ?? <Skeleton width={180} />}
          </Typography>
          {series && <FreshnessChip status={series.freshness.status} />}
        </Stack>
        {series && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Synced {formatAgo(series.freshness.last_synced_at, now)}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="warning">{error.message}. Showing the last data loaded.</Alert>}
      {series && <FreshnessAlert freshness={series.freshness} now={now} />}

      {/* Metric picker: each card shows that metric's shape over the selected range. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1, sm: 2 } }}>
        {METRICS.map((m) => (
          <MetricCard
            key={m.key}
            compact
            metric={m}
            value={series?.latest[m.key] ?? null}
            trend={series?.points.map((p) => p[m.key]) ?? []}
            tone={metricTone(m.key, series?.direction?.[m.key], series?.latest[m.key]).tone}
            stale={stale}
            selected={m.key === metric.key}
            onClick={() => update('metric', m.key)}
          />
        ))}
      </Box>

      <Paper variant="outlined" sx={{ overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}>
          {loading && <LinearProgress sx={{ height: 3 }} />}
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 2, p: { xs: 2.5, sm: 3 }, pb: 1 }}
        >
          <Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {metric.label} · {rangeLabel}
              {series?.data_since && (
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  {' '}
                  · collecting since {formatDateTime(series.data_since)}
                </Box>
              )}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography
                component="div"
                sx={{
                  fontSize: { xs: 44, sm: 52 },
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                  color: stale ? 'text.secondary' : 'text.primary',
                }}
              >
                {series ? formatMetric(metric, series.latest[metric.key], false) : '—'}
              </Typography>
              {metric.unit && (
                <Typography sx={{ color: 'text.secondary', fontSize: 20, fontWeight: 500 }}>
                  {metric.unit}
                </Typography>
              )}
              {stale && (
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600, ml: 0.5 }}>
                  last known
                </Typography>
              )}
            </Stack>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 1.25, minHeight: 24 }}>
              <ChangeChip metric={metric} value={avgChange} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {avgChange != null
                  ? `average vs ${series!.previous_label.toLowerCase()}`
                  : series
                    ? `No ${series.previous_label.toLowerCase()} data to compare`
                    : ''}
              </Typography>
            </Stack>
            {series && !stale && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: toneColor }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {toneLabel}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  over the last 2 hours
                </Typography>
              </Stack>
            )}
          </Box>

          <Box sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={range}
              onChange={(_, v) => v && update('range', v)}
              sx={{
                width: { xs: '100%', md: 'auto' },
                bgcolor: 'action.hover',
                p: 0.5,
                borderRadius: 999,
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  border: 0,
                  borderRadius: '999px !important',
                  flex: { xs: 1, md: 'none' },
                  px: 2,
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  '&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 },
                },
              }}
            >
              {RANGES.map((r) => (
                <ToggleButton key={r.key} value={r.key}>
                  {r.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Stack>

        {series && (
          <Stack direction="row" sx={{ gap: 2.5, px: { xs: 2.5, sm: 3 }, pt: 1, flexWrap: 'wrap' }}>
            <LegendItem color={lineColor} label={currentLabel} />
            <LegendItem color={muted} label={series.previous_label} dashed />
            {series.gaps.length > 0 && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.5,
                    border: 1,
                    borderColor: 'error.main',
                    background: (t) =>
                      `repeating-linear-gradient(45deg, transparent 0 3px, ${t.vars!.palette.error.main} 3px 4px)`,
                    opacity: 0.6,
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No data
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1, position: 'relative' }}>
          {series ? (
            <>
              <MetricChart
                metric={metric}
                color={lineColor}
                points={series.points}
                previous={series.previous}
                previousLabel={series.previous_label}
                currentLabel={currentLabel}
                gaps={series.gaps}
                start={series.start}
                end={series.end}
              />
              {!hasData && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                    px: 3,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography sx={{ color: 'text.secondary' }}>
                    No readings {range === 'today' ? 'today' : `in the last ${rangeLabel.toLowerCase()}`}.
                    <br />
                    Last sync was {formatAgo(series.freshness.last_synced_at, now)}.
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Skeleton variant="rounded" height={320} sx={{ mx: 1, my: 1 }} />
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 2,
            px: { xs: 2.5, sm: 3 },
            py: 2,
            mt: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stat label="Low" value={formatMetric(metric, stats?.min)} />
          <Stat label="Average" value={formatMetric(metric, stats?.avg)} />
          <Stat label="High" value={formatMetric(metric, stats?.max)} />
        </Box>
      </Paper>

      {series && <GapList gaps={series.gaps} />}
    </Stack>
  )
}

function BackLink() {
  return (
    <Button
      component={RouterLink}
      to="/pond"
      startIcon={<ArrowBackIcon />}
      size="small"
      sx={{ ml: -1, color: 'text.secondary' }}
    >
      All devices
    </Button>
  )
}

function GapList({ gaps }: { gaps: Gap[] }) {
  if (gaps.length === 0) {
    return (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: 'success.main' }}>
        <CheckCircleOutlineIcon fontSize="small" />
        <Typography variant="body2">No sync gaps in this period.</Typography>
      </Stack>
    )
  }
  return (
    <Paper variant="outlined">
      <Typography variant="subtitle2" sx={{ px: 2.5, pt: 2 }}>
        Sync gaps ({gaps.length})
      </Typography>
      <List dense sx={{ px: 0.5 }}>
        {[...gaps].reverse().map((gap) => (
          <ListItem key={gap.start}>
            <ListItemText
              primary={`${formatDateTime(gap.start)} → ${formatDateTime(gap.end)}`}
              secondary={`No data for ${formatDuration(gap.seconds)}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
