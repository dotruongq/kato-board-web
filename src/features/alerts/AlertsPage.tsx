import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState, type ReactNode } from 'react'
import { formatAgo } from '../../lib/format'
import { useNow, usePolling } from '../../lib/usePolling'
import { fetchDevices } from '../pond/api'
import { fetchAlertHistory, fetchAlertSettings, runCheckNow, saveAlertSettings, sendTestNotification } from './api'
import { disablePush, enablePush, pushStatus, type PushStatus } from './push'
import type { AlertSettings, Limit, SentNotice, Severity } from './types'

type MetricKey = 'ph' | 'temp' | 'tds'

const METRICS: { key: MetricKey; label: string; unit: string; step: number; hint: string }[] = [
  { key: 'ph', label: 'pH', unit: '', step: 0.05, hint: 'Koi usually do best around 7.0–8.5.' },
  { key: 'temp', label: 'Water temperature', unit: '°C', step: 0.5, hint: '' },
  { key: 'tds', label: 'TDS', unit: 'ppm', step: 10, hint: 'Set limits that match your pond.' },
]

const SEVERITY_COLOR: Record<Severity, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {!subtitle && <Box sx={{ mb: 2 }} />}
      {children}
    </Paper>
  )
}

const toF = (c: number) => `${Math.round((c * 9) / 5 + 32)}°F`

function parse(text: string): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

function LimitRow({
  metric,
  limit,
  current,
  onChange,
}: {
  metric: (typeof METRICS)[number]
  limit: Limit
  current: number | null | undefined
  onChange: (l: Limit) => void
}) {
  const invalid = limit.min !== null && limit.max !== null && limit.min >= limit.max
  const field = (bound: 'min' | 'max') => (
    <TextField
      size="small"
      type="number"
      label={bound === 'min' ? 'Lower limit' : 'Upper limit'}
      value={limit[bound] ?? ''}
      onChange={(e) => onChange({ ...limit, [bound]: parse(e.target.value) })}
      disabled={!limit.enabled}
      error={invalid}
      slotProps={{
        htmlInput: { step: metric.step, inputMode: 'decimal' },
        input: metric.unit ? { endAdornment: <InputAdornment position="end">{metric.unit}</InputAdornment> } : {},
      }}
      helperText={
        metric.key === 'temp' && limit[bound] !== null ? toF(limit[bound]!) : bound === 'min' ? 'Empty = none' : ' '
      }
      sx={{ flex: 1, minWidth: 0 }}
    />
  )
  const now =
    current == null
      ? null
      : metric.key === 'temp'
        ? `${current.toFixed(1)}°C (${toF(current)})`
        : metric.key === 'ph'
          ? current.toFixed(2)
          : `${Math.round(current)} ppm`
  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <FormControlLabel
          control={<Switch checked={limit.enabled} onChange={(e) => onChange({ ...limit, enabled: e.target.checked })} />}
          label={<Typography sx={{ fontWeight: 600 }}>{metric.label}</Typography>}
        />
        {now && (
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Now {now}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" sx={{ gap: 1.5, mt: 1 }}>
        {field('min')}
        {field('max')}
      </Stack>
      {invalid ? (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          The lower limit must be below the upper limit.
        </Typography>
      ) : (
        metric.hint && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {metric.hint}
          </Typography>
        )
      )}
    </Box>
  )
}

function PushSection({ onMessage }: { onMessage: (m: string) => void }) {
  const [status, setStatus] = useState<PushStatus | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void pushStatus().then(setStatus)
  }, [])

  const run = async (action: () => Promise<PushStatus | void>, done?: string) => {
    setBusy(true)
    try {
      const next = await action()
      if (next) setStatus(next)
      if (done) onMessage(done)
    } catch (err) {
      onMessage(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section
      title="Notifications on this device"
      subtitle="Turn this on on each phone, tablet or computer that should ring. Alerts arrive even when Kato Board is closed."
    >
      {status === null && <Skeleton variant="rounded" height={40} />}
      {status === 'unsupported' && (
        <Alert severity="info">
          This browser can't receive notifications. On iPhone or iPad, add Kato Board to your Home Screen first
          (Share → Add to Home Screen), then open it from there.
        </Alert>
      )}
      {status === 'not-configured' && (
        <Alert severity="warning">Push notifications aren't set up on the server yet.</Alert>
      )}
      {status === 'blocked' && (
        <Alert severity="warning">
          Notifications are blocked for this site. Allow them in your browser or phone settings, then reload.
        </Alert>
      )}
      {(status === 'off' || status === 'on') && (
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: { sm: 'center' } }}>
          <Chip
            icon={status === 'on' ? <NotificationsActiveOutlinedIcon /> : <NotificationsOffOutlinedIcon />}
            label={status === 'on' ? 'On for this device' : 'Off for this device'}
            color={status === 'on' ? 'success' : 'default'}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Box sx={{ flex: 1 }} />
          {status === 'on' ? (
            <>
              <Button
                variant="outlined"
                startIcon={<SendOutlinedIcon />}
                disabled={busy}
                onClick={() => run(async () => void (await sendTestNotification()), 'Test notification sent')}
              >
                Send a test
              </Button>
              <Button color="inherit" disabled={busy} onClick={() => run(disablePush, 'Notifications turned off')}>
                Turn off
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<NotificationsActiveOutlinedIcon />}
              disabled={busy}
              onClick={() => run(enablePush)}
            >
              Turn on notifications
            </Button>
          )}
        </Stack>
      )}
    </Section>
  )
}

function History({ items, now }: { items: SentNotice[] | null; now: number }) {
  if (!items) return <Skeleton variant="rounded" height={80} />
  if (items.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nothing yet. Notifications will be listed here as they're sent.
      </Typography>
    )
  }
  return (
    <Stack divider={<Divider flexItem />} sx={{ gap: 1.25 }}>
      {items.map((n) => (
        <Stack key={`${n.key}-${n.sent_at}`} direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ width: 8, height: 8, mt: 0.9, borderRadius: '50%', bgcolor: `${SEVERITY_COLOR[n.severity]}.main` }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {n.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {n.body}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {formatAgo(n.sent_at, now)}
            {n.delivered === 0 && ' · not delivered'}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

export default function AlertsPage() {
  const now = useNow()
  const [settings, setSettings] = useState<AlertSettings | null>(null)
  const [saved, setSaved] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const devices = usePolling(fetchDevices, 60_000)
  const history = usePolling(fetchAlertHistory, 60_000)

  useEffect(() => {
    fetchAlertSettings()
      .then((s) => {
        setSettings(s)
        setSaved(JSON.stringify(s))
      })
      .catch((err: Error) => setLoadError(err.message))
  }, [])

  const latest = devices.data?.devices[0]?.latest
  const dirty = settings !== null && JSON.stringify(settings) !== saved
  const invalid =
    settings !== null &&
    METRICS.some(({ key }) => {
      const l = settings[key]
      return l.min !== null && l.max !== null && l.min >= l.max
    })

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const s = await saveAlertSettings(settings)
      setSettings(s)
      setSaved(JSON.stringify(s))
      setMessage('Alert settings saved')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const checkNow = async () => {
    try {
      const r = await runCheckNow()
      setMessage(r.sent.length ? `Sent ${r.sent.length} notification(s)` : 'Checked: nothing new to report')
      history.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Check failed')
    }
  }

  return (
    <Stack spacing={2.5}>
      <div>
        <Typography variant="h4" component="h1">
          Alerts
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Each alert rings once when it starts. Out-of-range alerts reset quietly once the reading is back inside
          your limits.
        </Typography>
      </div>

      <PushSection onMessage={setMessage} />

      <Section title="Your limits" subtitle="Get notified when a reading goes above or below these. They apply to every pond.">
        {loadError && <Alert severity="error">{loadError}</Alert>}
        {!settings && !loadError && <Skeleton variant="rounded" height={260} />}
        {settings && (
          <Stack spacing={3}>
            {METRICS.map((m) => (
              <LimitRow
                key={m.key}
                metric={m}
                limit={settings[m.key]}
                current={latest?.[m.key]}
                onChange={(l) => setSettings({ ...settings, [m.key]: l })}
              />
            ))}
            <Divider />
            <Stack>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Also notify me about</Typography>
              <FormControlLabel
                control={
                  <Switch checked={settings.offline} onChange={(e) => setSettings({ ...settings, offline: e.target.checked })} />
                }
                label="A pond going offline, and when it's back"
              />
              <FormControlLabel
                control={
                  <Switch checked={settings.weather} onChange={(e) => setSettings({ ...settings, weather: e.target.checked })} />
                }
                label="Weather: rain, cold or freezing nights, heat, sharp swings"
              />
            </Stack>
            <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                color="inherit"
                disabled={!dirty || saving}
                onClick={() => setSettings(JSON.parse(saved) as AlertSettings)}
              >
                Undo changes
              </Button>
              <Button variant="contained" disabled={!dirty || invalid || saving} onClick={save}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Section>

      <Section title="Recent notifications">
        <History items={history.data} now={now} />
        <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
          <Button size="small" color="inherit" onClick={checkNow}>
            Check now
          </Button>
        </Stack>
      </Section>

      <Snackbar
        open={message !== null}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  )
}
