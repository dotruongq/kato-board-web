import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import { useEffect, useState } from 'react'
import { onForegroundNotice, refreshPushToken } from './push'

/** Shows alerts that arrive while Kato Board is open, and keeps this device's push token fresh. */
export function PushToasts() {
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null)

  useEffect(() => {
    void refreshPushToken().catch(() => undefined)
    let unsubscribe = () => {}
    void onForegroundNotice((title, body) => setNotice({ title, body })).then((u) => (unsubscribe = u))
    return () => unsubscribe()
  }, [])

  return (
    <Snackbar
      open={notice !== null}
      autoHideDuration={10_000}
      onClose={() => setNotice(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="warning" variant="filled" onClose={() => setNotice(null)} sx={{ width: '100%' }}>
        <AlertTitle>{notice?.title}</AlertTitle>
        {notice?.body}
      </Alert>
    </Snackbar>
  )
}
