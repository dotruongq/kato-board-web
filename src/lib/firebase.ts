import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'

// These values are public by design (they identify the Firebase project, not a secret).
// Access is enforced by the API, which only accepts the allowed Google accounts.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId)

// Firebase keeps the session in the browser (local persistence) and refreshes the
// token every hour on its own, so a device stays signed in until "Sign out".
export const firebaseApp = firebaseConfigured ? initializeApp(config) : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null

/** Config for the push service worker, which can't read Vite's env, passed in its URL. */
export const firebaseConfigQuery = new URLSearchParams(
  Object.entries(config).filter((e): e is [string, string] => Boolean(e[1])),
).toString()

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
