import { apiGet, browserTimeZone } from '../../lib/api'
import type { DevicesResponse, RangeKey, SeriesResponse } from './types'

export const fetchDevices = () => apiGet<DevicesResponse>('/api/pond/devices')

export const fetchReadings = (deviceId: string, range: RangeKey) =>
  apiGet<SeriesResponse>(`/api/pond/devices/${encodeURIComponent(deviceId)}/readings`, {
    range,
    tz: browserTimeZone,
  })
