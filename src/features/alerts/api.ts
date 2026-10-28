import { apiGet, apiSend } from '../../lib/api'
import type { AlertSettings, CheckResult, SentNotice } from './types'

export const fetchAlertSettings = () => apiGet<AlertSettings>('/api/alerts/settings')
export const saveAlertSettings = (s: AlertSettings) => apiSend<AlertSettings>('PUT', '/api/alerts/settings', s)
export const fetchAlertHistory = () => apiGet<SentNotice[]>('/api/alerts/history', { limit: '20' })
export const registerPushDevice = (token: string) => apiSend('POST', '/api/alerts/devices', { token })
export const unregisterPushDevice = (token: string) => apiSend('POST', '/api/alerts/devices/remove', { token })
export const sendTestNotification = () => apiSend<{ delivered: number }>('POST', '/api/alerts/test')
export const runCheckNow = () => apiSend<CheckResult>('POST', '/api/alerts/check-now')
