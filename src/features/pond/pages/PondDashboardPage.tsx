import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { formatDuration } from '../../../lib/format'
import { useNow, usePolling } from '../../../lib/usePolling'
import { fetchDevices } from '../api'
import { DeviceSection } from '../components/DeviceSection'

const REFRESH_MS = 60_000

export default function PondDashboardPage() {
  const { data, error, loading, fetchedAt, refresh } = usePolling(fetchDevices, REFRESH_MS)
  const now = useNow()
  const devices = data?.devices ?? []
  const notLive = devices.filter((d) => d.freshness.status !== 'live')

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <Typography variant="h4" component="h1">
            Pond monitoring
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {data
              ? `${devices.length} device${devices.length === 1 ? '' : 's'} · refreshed ${
                  fetchedAt ? formatDuration((now - fetchedAt) / 1000) : ''
                } ago`
              : 'Loading devices…'}
          </Typography>
        </div>
        <Tooltip title="Refresh now">
          <span>
            <IconButton onClick={refresh} disabled={loading} aria-label="Refresh">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && !data && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          {error.message}. Check that the API is running and VITE_API_URL is correct.
        </Alert>
      )}
      {error && data && fetchedAt && (
        <Alert severity="warning">
          Can't reach the API. Everything below is from {formatDuration((now - fetchedAt) / 1000)} ago.
        </Alert>
      )}
      {notLive.length > 0 && (
        <Alert severity={notLive.some((d) => d.freshness.status === 'offline') ? 'error' : 'warning'}>
          {notLive.length} of {devices.length} device{devices.length === 1 ? ' is' : 's are'} not reporting
          live data: {notLive.map((d) => d.device_name).join(', ')}
        </Alert>
      )}

      {!data && loading &&
        [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: 5 }} />)}

      {data && devices.length === 0 && (
        <Alert severity="info">No devices found in the readings collection yet.</Alert>
      )}

      <Stack spacing={5}>
        {devices.map((device) => (
          <DeviceSection key={device.device_id} device={device} now={now} />
        ))}
      </Stack>
    </Stack>
  )
}
