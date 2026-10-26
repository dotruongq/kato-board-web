import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { formatAgo, formatDateTime } from '../../../lib/format'
import type { Freshness, FreshnessStatus } from '../types'

const STATUS: Record<FreshnessStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  live: { label: 'Live', color: 'success' },
  delayed: { label: 'Delayed', color: 'warning' },
  offline: { label: 'Offline', color: 'error' },
}

export function FreshnessChip({ status }: { status: FreshnessStatus }) {
  const { label, color } = STATUS[status]
  return (
    <Chip
      size="small"
      color={color}
      variant={status === 'live' ? 'outlined' : 'filled'}
      label={label}
      icon={
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'currentColor',
            ml: '8px !important',
            animation: status === 'live' ? 'pulse 2s ease-in-out infinite' : 'none',
            '@keyframes pulse': { '50%': { opacity: 0.3 } },
          }}
        />
      }
    />
  )
}

export function FreshnessAlert({ freshness, now }: { freshness: Freshness; now: number }) {
  if (freshness.status === 'live' || !freshness.message) return null
  return (
    <Alert severity={freshness.status === 'offline' ? 'error' : 'warning'} variant="outlined">
      <AlertTitle sx={{ mb: 0.25 }}>
        {freshness.status === 'offline' ? 'Not live data' : 'Data delayed'}
      </AlertTitle>
      {freshness.message}
      <Box component="span" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
        Last sync {formatAgo(freshness.last_synced_at, now)} ({formatDateTime(freshness.last_synced_at)})
      </Box>
    </Alert>
  )
}
