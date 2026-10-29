import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

export const COPYRIGHT_OWNER = 'Kato Koi Farm'
const FIRST_YEAR = 2026

/** "© 2026 Kato Koi Farm. All rights reserved." (becomes "2026–2027" etc. in later years). */
export function Copyright({ sx }: { sx?: SxProps<Theme> }) {
  const year = new Date().getFullYear()
  const years = year > FIRST_YEAR ? `${FIRST_YEAR}–${year}` : `${FIRST_YEAR}`
  return (
    <Typography
      component="p"
      variant="caption"
      sx={[{ color: 'text.disabled', textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      © {years} {COPYRIGHT_OWNER}. All rights reserved.
    </Typography>
  )
}
