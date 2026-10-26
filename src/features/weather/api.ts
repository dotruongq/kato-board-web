import { apiGet } from '../../lib/api'
import type { Outlook, Weather } from './types'

export const fetchWeather = () => apiGet<Weather>('/api/weather')
export const fetchOutlook = () => apiGet<Outlook>('/api/weather/outlook')
