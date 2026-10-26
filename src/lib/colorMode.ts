import { useColorScheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

/** True when the page is in dark mode, whether picked by the toggle or by the device. */
export function useIsDark(): boolean {
  const { mode, systemMode } = useColorScheme()
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true })
  const resolved = mode === 'system' ? systemMode : mode
  return resolved ? resolved === 'dark' : systemDark
}
