import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { ApiError, apiGet } from '../lib/api'
import { auth, firebaseConfigured, googleProvider } from '../lib/firebase'
import { BrandLogo } from './BrandLogo'
import { Copyright } from './Copyright'

interface AuthState {
  user: User | null
  signOut: () => void
}

const AuthContext = createContext<AuthState>({ user: null, signOut: () => {} })

export const useAuth = () => useContext(AuthContext)

function GoogleMark() {
  return (
    <Box component="svg" viewBox="0 0 48 48" sx={{ width: 20, height: 20 }} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </Box>
  )
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        alignContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 400, p: { xs: 2.5, sm: 4 }, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <BrandLogo height={{ xs: 64, sm: 84 }} />
        </Box>
        <Typography
          sx={{ fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', fontSize: 13, mb: 2 }}
        >
          Board
        </Typography>
        {children}
      </Paper>
      <Copyright />
    </Box>
  )
}

function SignInScreen() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    if (!auth) return
    setBusy(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : ''
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Sign in to see your ponds. You'll stay signed in on this device.
      </Typography>
      <Button
        fullWidth
        size="large"
        variant="outlined"
        onClick={signIn}
        disabled={busy}
        startIcon={busy ? <CircularProgress size={18} /> : <GoogleMark />}
        sx={{ py: 1.25, borderRadius: 999, color: 'text.primary', borderColor: 'divider' }}
      >
        Sign in with Google
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}
    </Screen>
  )
}

function NotAllowedScreen({ email, onSignOut }: { email: string | null; onSignOut: () => void }) {
  return (
    <Screen>
      <Alert severity="warning" sx={{ my: 2, textAlign: 'left' }}>
        {email ?? 'This account'} isn't allowed to use Kato Board.
      </Alert>
      <Button fullWidth variant="outlined" onClick={onSignOut} sx={{ borderRadius: 999 }}>
        Use a different Google account
      </Button>
    </Screen>
  )
}

function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <CircularProgress />
    </Box>
  )
}

type Access = 'checking' | 'allowed' | 'denied'

/** Shows the app only to a signed-in Google account the API accepts. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [access, setAccess] = useState<Access>('checking')

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setAccess('checking')
      setUser(u)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    apiGet<{ email: string }>('/api/me')
      .then(() => !cancelled && setAccess('allowed'))
      .catch((err) => {
        if (cancelled) return
        // Only a definite "not this account" blocks the app; if the API is down,
        // let the dashboard load and show its own "can't reach the API" banner.
        setAccess(err instanceof ApiError && err.status === 403 ? 'denied' : 'allowed')
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const doSignOut = () => {
    if (auth) void signOut(auth)
  }

  if (!firebaseConfigured) {
    return (
      <Screen>
        <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
          Login isn't configured: set the VITE_FIREBASE_* variables and rebuild.
        </Alert>
      </Screen>
    )
  }
  if (user === undefined) return <Loading />
  if (!user) return <SignInScreen />
  if (access === 'checking') return <Loading />
  if (access === 'denied') return <NotAllowedScreen email={user.email} onSignOut={doSignOut} />
  return <AuthContext.Provider value={{ user, signOut: doSignOut }}>{children}</AuthContext.Provider>
}
