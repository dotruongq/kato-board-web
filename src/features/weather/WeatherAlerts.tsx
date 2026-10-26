import AcUnitIcon from '@mui/icons-material/AcUnit'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import FoggyIcon from '@mui/icons-material/Foggy'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined'
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { RainCloudIcon } from './RainCloudIcon'
import type { AlertKind, Condition, ForecastDay, Outlook, Severity, WeatherAlert } from './types'

type Icon = ComponentType<SvgIconProps>

const SEVERITY: Record<Severity, { label: string; palette: 'error' | 'warning' | 'info' }> = {
  critical: { label: 'Critical', palette: 'error' },
  warning: { label: 'Warning', palette: 'warning' },
  info: { label: 'Heads-up', palette: 'info' },
}

const KIND_ICON: Record<AlertKind, Icon> = {
  rain_now: RainCloudIcon,
  rain: RainCloudIcon,
  cold: AcUnitIcon,
  freeze: AcUnitIcon,
  heat: LocalFireDepartmentOutlinedIcon,
  swing_up: TrendingUpIcon,
  swing_down: TrendingDownIcon,
}

const DAY_ICON: Record<Condition, { Icon: Icon; color: string }> = {
  clear: { Icon: WbSunnyOutlinedIcon, color: '#f2a516' },
  partly_cloudy: { Icon: WbCloudyOutlinedIcon, color: '#f2a516' },
  cloudy: { Icon: CloudOutlinedIcon, color: 'text.secondary' },
  fog: { Icon: FoggyIcon, color: 'text.secondary' },
  drizzle: { Icon: RainCloudIcon, color: '#3987e5' },
  rain: { Icon: RainCloudIcon, color: '#3987e5' },
  snow: { Icon: AcUnitIcon, color: '#7cc4f2' },
  thunderstorm: { Icon: ThunderstormOutlinedIcon, color: '#9085e9' },
}

const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/** Dates come as plain "YYYY-MM-DD" in the location's timezone; parse as local noon to avoid off-by-one. */
function dayName(iso: string, index: number): string {
  return index === 0 ? 'Today' : weekday.format(new Date(`${iso}T12:00:00`))
}

function worstSeverity(alerts: WeatherAlert[]): Severity | null {
  return alerts.find((a) => a.severity === 'critical')?.severity
    ?? alerts.find((a) => a.severity === 'warning')?.severity
    ?? alerts[0]?.severity
    ?? null
}

function AlertRow({ alert }: { alert: WeatherAlert }) {
  const { label, palette } = SEVERITY[alert.severity]
  const Icon = KIND_ICON[alert.kind]
  return (
    <Stack
      direction="row"
      sx={{
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (t) => alpha(t.palette[palette].main, 0.08),
        borderLeft: 3,
        borderColor: `${palette}.main`,
      }}
    >
      <Icon sx={{ color: `${palette}.main`, fontSize: 22, mt: 0.25 }} />
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 650 }}>
            {alert.title}
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: `${palette}.main` }}
          >
            {label}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          {alert.detail}
        </Typography>
      </Box>
    </Stack>
  )
}

function ForecastStrip({ outlook }: { outlook: Outlook }) {
  const alertDays = new Set(outlook.alerts.map((a) => a.day))
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.5 }}>
      {outlook.forecast.map((d: ForecastDay, i) => {
        const { Icon, color } = DAY_ICON[d.condition]
        const rain = d.precip_probability ?? 0
        return (
          <Stack
            key={d.day}
            sx={{
              alignItems: 'center',
              gap: 0.5,
              py: 1,
              borderRadius: 2,
              bgcolor: alertDays.has(d.day) ? 'action.hover' : 'transparent',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: i === 0 ? 'text.primary' : 'text.secondary' }}>
              {dayName(d.day, i)}
            </Typography>
            <Icon sx={{ fontSize: 20, color }} />
            <Typography sx={{ fontSize: 13, fontWeight: 650, lineHeight: 1.1 }}>{Math.round(d.high)}°</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.1 }}>{Math.round(d.low)}°</Typography>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', gap: 0.25, minHeight: 16, visibility: rain >= 20 ? 'visible' : 'hidden' }}
            >
              <WaterDropOutlinedIcon sx={{ fontSize: 12, color: '#3987e5' }} />
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{rain}%</Typography>
            </Stack>
          </Stack>
        )
      })}
    </Box>
  )
}

interface Props {
  outlook: Outlook | null
  // Phone layout: stretches to fill the row under the top bar.
  wide?: boolean
}

/** Alert count chip; click to expand the alerts and the 7-day forecast. */
export function WeatherAlerts({ outlook, wide = false }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  if (!outlook) return null

  const count = outlook.alerts.length
  const worst = worstSeverity(outlook.alerts)
  const palette = worst ? SEVERITY[worst].palette : null
  const LeadIcon = worst === 'info' ? InfoOutlinedIcon : worst ? WarningAmberRoundedIcon : CheckCircleOutlineOutlinedIcon
  const label = count ? `${count} alert${count === 1 ? '' : 's'}` : 'All clear'

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchor)}
        aria-label={count ? `${label}. Show details.` : 'No weather alerts. Show 7-day forecast.'}
        sx={{
          height: 34,
          px: 1.25,
          gap: 0.75,
          borderRadius: 999,
          border: 1,
          borderColor: palette ? (t) => alpha(t.palette[palette].main, 0.5) : 'divider',
          bgcolor: palette ? (t) => alpha(t.palette[palette].main, 0.12) : 'action.hover',
          width: wide ? '100%' : 'auto',
          whiteSpace: 'nowrap',
          '&:hover': { borderColor: palette ? `${palette}.main` : 'text.disabled' },
        }}
      >
        <LeadIcon sx={{ fontSize: 19, color: palette ? `${palette}.main` : 'success.main' }} />
        <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
          {label}
        </Typography>
      </ButtonBase>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: wide ? 'center' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: wide ? 'center' : 'right' }}
        slotProps={{
          paper: {
            variant: 'outlined',
            sx: {
              mt: 1,
              width: { xs: 'calc(100vw - 32px)', sm: 400 },
              maxWidth: 400,
              p: 2,
              borderRadius: 4,
              // Same colour as the cards underneath, so a shadow is what separates it.
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.28)',
            },
          },
        }}
      >
        <Stack sx={{ gap: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 650, lineHeight: 1.3 }}>
              Pond weather alerts
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {outlook.location} · next 7 days
            </Typography>
          </Box>

          {count ? (
            <Stack sx={{ gap: 1 }}>
              {outlook.alerts.map((a) => (
                <AlertRow key={`${a.kind}-${a.day}`} alert={a} />
              ))}
            </Stack>
          ) : (
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', color: 'success.main' }}>
              <CheckCircleOutlineOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No rain, cold nights, heat or sharp temperature swings coming up.
              </Typography>
            </Stack>
          )}

          <Divider />
          <ForecastStrip outlook={outlook} />
        </Stack>
      </Popover>
    </>
  )
}
