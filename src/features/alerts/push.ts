import { deleteToken, getMessaging, getToken, isSupported, onMessage, type MessagePayload } from 'firebase/messaging'
import { firebaseApp, firebaseConfigQuery } from '../../lib/firebase'
import { registerPushDevice, unregisterPushDevice } from './api'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined
const TOKEN_KEY = 'kato-push-token'

export type PushStatus = 'unsupported' | 'not-configured' | 'blocked' | 'off' | 'on'

function savedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function remember(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private mode etc.: status just shows "off" after a reload.
  }
}

export async function pushStatus(): Promise<PushStatus> {
  if (!firebaseApp || !(await isSupported()) || !('Notification' in window)) return 'unsupported'
  if (!VAPID_KEY) return 'not-configured'
  if (Notification.permission === 'denied') return 'blocked'
  return Notification.permission === 'granted' && savedToken() ? 'on' : 'off'
}

async function registration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${firebaseConfigQuery}`, {
    scope: '/firebase-cloud-messaging-push-scope',
  })
}

/** Ask for permission (if needed), get this device's push token and tell the API about it. */
export async function enablePush(): Promise<PushStatus> {
  if (!firebaseApp || !VAPID_KEY) return pushStatus()
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'blocked' : 'off'
  const token = await getToken(getMessaging(firebaseApp), {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: await registration(),
  })
  await registerPushDevice(token)
  remember(token)
  return 'on'
}

export async function disablePush(): Promise<PushStatus> {
  const token = savedToken()
  if (token) {
    await unregisterPushDevice(token).catch(() => undefined)
    if (firebaseApp) await deleteToken(getMessaging(firebaseApp)).catch(() => undefined)
  }
  remember(null)
  return pushStatus()
}

/** Keep the API's copy of this device's token fresh (tokens can rotate). Safe to call on every load. */
export async function refreshPushToken(): Promise<void> {
  if ((await pushStatus()) !== 'on' || !firebaseApp || !VAPID_KEY) return
  const token = await getToken(getMessaging(firebaseApp), {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: await registration(),
  })
  if (token !== savedToken()) {
    await registerPushDevice(token)
    remember(token)
  }
}

export interface ForegroundNotice {
  title: string
  body: string
  link?: string
  tag?: string
}

/**
 * While the app is open, Firebase hands alerts to the page instead of showing them. Show a
 * system notification anyway (so it lands in the phone's notification shade like any other
 * alert) and pass it to the page for the in-app banner.
 */
export async function onForegroundNotice(handler: (n: ForegroundNotice) => void): Promise<() => void> {
  if (!firebaseApp || !(await isSupported())) return () => {}
  return onMessage(getMessaging(firebaseApp), (payload: MessagePayload) => {
    const notice: ForegroundNotice = {
      title: payload.notification?.title ?? 'Kato Board',
      body: payload.notification?.body ?? '',
      link: payload.fcmOptions?.link,
      tag: (payload.notification as { tag?: string } | undefined)?.tag,
    }
    void showSystemNotification(notice)
    handler(notice)
  })
}

async function showSystemNotification(n: ForegroundNotice): Promise<void> {
  if (Notification.permission !== 'granted') return
  const reg = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope')
  await reg?.showNotification(n.title, {
    body: n.body,
    icon: '/brand/koi-192.png',
    badge: '/brand/koi-badge.png',
    tag: n.tag,
    // Read by the service worker's click handler to open the right page.
    data: { katoUrl: n.link ?? '/pond' },
  })
}
