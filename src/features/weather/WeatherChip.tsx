import AcUnitIcon from '@mui/icons-material/AcUnit'
import AirOutlinedIcon from '@mui/icons-material/AirOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import FoggyIcon from '@mui/icons-material/Foggy'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined'
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined'
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined'
import Box from '@mui/material/Box'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useNow, usePolling } from '../../lib/usePolling'
import { fetchWeather } from './api'
import { RainCloudIcon } from './RainCloudIcon'
import type { Weather } from './types'

const SUN = '#f2a516'
const MOON = '#9aa6f4'
const WIND = '#4fb0c6'

// The API caches for 10 min, so polling faster gains nothing.
const REFRESH_MS = 10 * 60_000

type Icon = ComponentType<SvgIconProps>

function bothScales(value: number, unit: 'F' | 'C'): { f: number; c: number } {
  return unit === 'F'
    ? { f: Math.round(value), c: Math.round(((value - 32) * 5) / 9) }
    : { f: Math.round((value * 9) / 5 + 32), c: Math.round(value) }
}

/** Condition icon; none for clear skies, since the sun/moon by the time already says it. */
function iconFor(w: Weather): { Icon: Icon; color: string } | null {
  switch (w.condition) {
    case 'clear':
      return null
    case 'partly_cloudy':
      return w.is_day
        ? { Icon: WbCloudyOutlinedIcon, color: SUN }
        : { Icon: NightsStayOutlinedIcon, color: MOON }
    case 'fog':
      return { Icon: FoggyIcon, color: 'text.secondary' }
    case 'drizzle':
    case 'rain':
      return { Icon: RainCloudIcon, color: '#3987e5' }
    case 'snow':
      return { Icon: AcUnitIcon, color: '#7cc4f2' }
    case 'thunderstorm':
      return { Icon: ThunderstormOutlinedIcon, color: '#9085e9' }
    default:
      return { Icon: CloudOutlinedIcon, color: 'text.secondary' }
  }
}

/** Compact "icon 64°F · 1:05 AM" pill for the top bar. Time is local to the weather location. */
export function WeatherChip() {
  const { data } = usePolling(fetchWeather, REFRESH_MS)
  const now = useNow(10_000)
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: data?.timezone }),
    [data?.timezone],
  )
  const time = timeFmt.format(now)
  const icon = data ? iconFor(data) : null
  // Day/night at the location (Open-Meteo's sunrise/sunset), shown whatever the weather.
  const dayNight = data ? (data.is_day ? 'Day' : 'Night') : null
  const wind = data ? `Wind ${data.wind_speed} ${data.wind_unit}, gusts ${data.wind_gusts}` : ''
  // Both scales, °F first: "64°F | 18°C".
  const temps = data ? bothScales(data.temperature, data.unit) : null
  const summary = data
    ? [data.windy ? `${data.description}, windy` : data.description, `${temps!.f}°F / ${temps!.c}°C`, wind].join(' · ')
    : ''

  const chip = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 0.625 },
        height: 34,
        px: { xs: 1, sm: 1.25 },
        borderRadius: 999,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
        whiteSpace: 'nowrap',
      }}
      aria-label={data ? `${summary} in ${data.location}. ${dayNight}, ${time}` : time}
    >
      {(icon || data?.windy) && (
        <Box component="span" sx={{ display: 'inline-flex', gap: { xs: 0.25, sm: 0.5 } }}>
          {icon && <icon.Icon sx={{ fontSize: { xs: 18, sm: 20 }, color: icon.color }} />}
          {data?.windy && <AirOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: WIND }} />}
        </Box>
      )}
      {data && (
        <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
          {temps!.f}°F
          <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400, mx: 0.625 }}>
            |
          </Box>
          {temps!.c}°C
        </Typography>
      )}
      {data && (
        <Box
          component="span"
          sx={{ width: '1px', height: 14, bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }}
        />
      )}
      {data &&
        (data.is_day ? (
          <LightModeOutlinedIcon sx={{ fontSize: 16, color: SUN }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: 16, color: MOON }} />
        ))}
      <Typography component="span" sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
        {time}
      </Typography>
    </Box>
  )

  return data ? (
    <Tooltip title={`${summary} · ${dayNight} · ${data.location}`}>
      {chip}
    </Tooltip>
  ) : (
    chip
  )
}
