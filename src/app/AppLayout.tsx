import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import { useColorScheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useIsDark } from '../lib/colorMode'
import { FEATURES } from '../features/registry'
import { WeatherAlerts } from '../features/weather/WeatherAlerts'
import { WeatherChip } from '../features/weather/WeatherChip'
import { fetchOutlook } from '../features/weather/api'
import { usePolling } from '../lib/usePolling'

const DRAWER_WIDTH = 232

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  return (
    <List sx={{ px: 1 }}>
      {FEATURES.map((f) => (
        <ListItemButton
          key={f.path}
          component={RouterLink}
          to={f.path}
          selected={pathname.startsWith(f.path)}
          onClick={onNavigate}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{f.icon}</ListItemIcon>
          <ListItemText primary={f.label} />
        </ListItemButton>
      ))}
    </List>
  )
}

function NightModeToggle() {
  const { setMode } = useColorScheme()
  const dark = useIsDark()
  const label = dark ? 'Switch to light mode' : 'Switch to night mode'
  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={() => setMode(dark ? 'light' : 'dark')} aria-label={label} sx={{ ml: 0.5, p: { xs: 0.75, sm: 1 } }}>
        {dark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}

// The API caches the forecast for 10 min, so polling faster gains nothing.
const OUTLOOK_REFRESH_MS = 10 * 60_000

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  // Fetched once here for the alerts chip, wherever it's shown.
  const { data: outlook } = usePolling(fetchOutlook, OUTLOOK_REFRESH_MS)
  // Mount weather widgets in one place only, so they don't poll twice.
  const isPhone = useMediaQuery((t: Theme) => t.breakpoints.down('sm'), { noSsr: true })

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src="/favicon.svg"
            alt=""
            sx={{ width: 28, height: 28, mr: 1.5, display: { xs: 'none', sm: 'block' } }}
          />
          <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 } }}>
            Kato Board
          </Typography>
          <NightModeToggle />
          {!isPhone && (
            <Stack direction="row" sx={{ ml: 'auto', pl: 1, gap: 1, flexShrink: 0, alignItems: 'center' }}>
              <WeatherAlerts outlook={outlook} />
              <WeatherChip />
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        <Toolbar />
        <Nav onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Nav />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          {/* Phones have no room in the top bar, so weather and alerts get their own row under it. */}
          {isPhone && (
            <Stack direction="row" sx={{ gap: 1, mb: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <WeatherAlerts outlook={outlook} wide />
              </Box>
              <WeatherChip />
            </Stack>
          )}
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
