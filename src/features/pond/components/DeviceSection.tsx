import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatAgo, formatDuration, formatRoughAgo } from '../../../lib/format'
import { METRICS, metricTone } from '../metrics'
import type { Device } from '../types'
import { FreshnessAlert, FreshnessChip } from './Freshness'
import { MetricCard } from './MetricCard'

export function DeviceSection({ device, now }: { device: Device; now: number }) {
  const { freshness } = device
  // Only offline values are greyed out; delayed data is still recent enough to trust.
  const stale = freshness.status === 'offline'

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}
      >
        <Typography variant="h6" component="h2">
          {device.device_name}
        </Typography>
        <FreshnessChip status={freshness.status} />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Synced {formatAgo(freshness.last_synced_at, now)}
        {freshness.reading_age_seconds != null &&
          ` · device reading ${formatDuration(freshness.reading_age_seconds)} old`}
      </Typography>

      {freshness.status !== 'live' && (
        <Box sx={{ mb: 2 }}>
          <FreshnessAlert freshness={freshness} now={now} />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {METRICS.map((metric) => {
          const { tone, label } = metricTone(metric.key, device.direction?.[metric.key], device.latest[metric.key])
          return (
          <MetricCard
            key={metric.key}
            metric={metric}
            value={device.latest[metric.key]}
            trend={device.trend.map((p) => p[metric.key])}
            tone={tone}
            toneLabel={label}
            change={device.change?.[metric.key]}
            changeLabel={device.change_since ? `vs ${formatRoughAgo(device.change_since, now)}` : undefined}
            stale={stale}
            trendCaption={[
              device.trend.length ? formatRoughAgo(device.trend[0].t, now) : '',
              stale ? `Stopped ${formatAgo(freshness.last_synced_at, now)}` : 'Now',
            ]}
            to={`/pond/devices/${encodeURIComponent(device.device_id)}?metric=${metric.key}`}
          />
          )
        })}
      </Box>
    </Box>
  )
}
