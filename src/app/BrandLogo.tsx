import Box from '@mui/material/Box'
import { useIsDark } from '../lib/colorMode'

/**
 * The Kato logo, swapped per theme: black lettering on light backgrounds,
 * white outlined lettering on dark ones. Files live in public/brand/.
 */
export function BrandLogo({ height }: { height: number | Record<string, number> }) {
  const dark = useIsDark()
  return (
    <Box
      component="img"
      src={dark ? '/brand/kato-logo-light.png' : '/brand/kato-logo-dark.png'}
      alt="Kato"
      sx={{ height, width: 'auto', display: 'block', flexShrink: 0 }}
    />
  )
}
