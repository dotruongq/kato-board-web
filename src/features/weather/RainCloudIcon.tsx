import { createSvgIcon } from '@mui/material/utils'

// Material Icons has no rain cloud, so this is drawn in the same outlined style:
// a cloud with three slanted drops underneath.
export const RainCloudIcon = createSvgIcon(
  <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 14.5h9a3.5 3.5 0 0 0 .55-6.96 5 5 0 0 0-9.6 1.03A3 3 0 0 0 7.5 14.5z" />
    <path d="M9 17.5l-1 2.5M12.5 17.5l-1 2.5M16 17.5l-1 2.5" />
  </g>,
  'RainCloud',
)
