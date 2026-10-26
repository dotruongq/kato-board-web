import { alpha, createTheme } from '@mui/material/styles'

// Starts on the device's light/dark setting; the top-bar button overrides it (saved in localStorage).
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0b5e6b' },
        background: { default: '#f3f4f6', paper: '#ffffff' },
        divider: 'rgba(15, 23, 42, 0.08)',
        text: { primary: '#0f1115', secondary: '#5b6170' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#5ccfdc' },
        background: { default: '#0b0d10', paper: '#15181d' },
        divider: 'rgba(255, 255, 255, 0.07)',
        text: { primary: '#eef0f3', secondary: '#9aa1ad' },
      },
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 650, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha('#f3f4f6', 0.8),
          backdropFilter: 'blur(12px)',
          color: theme.vars!.palette.text.primary,
          backgroundImage: 'none',
          ...theme.applyStyles('dark', { backgroundColor: alpha('#0b0d10', 0.8) }),
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          ...theme.applyStyles('dark', {
            // Faint top highlight so cards read as raised panels on the near-black page.
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 60%)',
          }),
        }),
        outlined: { borderRadius: 20 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars!.palette.background.default,
          backgroundImage: 'none',
        }),
      },
    },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
})
