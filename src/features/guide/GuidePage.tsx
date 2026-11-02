import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { GROUPS, GUIDES, UI, type Guide, type Lang, type Step } from './content'

// Step-by-step pond care for family looking after the pond, in Vietnamese and English.

const LANG_KEY = 'guide-lang'

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'vi'
    } catch {
      return 'vi'
    }
  })
  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // private mode: the choice just isn't remembered
    }
    // The rest of the app is in English.
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [lang])
  return [lang, setLang]
}

const pic = (name: string) => `/guide/${name}.jpg`

function Photo({ name, alt }: { name: string; alt: string }) {
  return (
    // Opens the full picture so it can be zoomed on a phone.
    <Box component="a" href={pic(name)} target="_blank" rel="noreferrer" sx={{ display: 'block', mt: 1.5 }}>
      <Box
        component="img"
        src={pic(name)}
        alt={alt}
        loading="lazy"
        sx={{
          display: 'block',
          width: '100%',
          maxWidth: 320,
          aspectRatio: '3 / 4',
          objectFit: 'cover',
          borderRadius: 3,
          bgcolor: 'action.hover',
        }}
      />
    </Box>
  )
}

function StepCard({ n, step, lang }: { n: number; step: Step; lang: Lang }) {
  const linked = step.link ? GUIDES.find((g) => g.slug === step.link) : undefined
  return (
    <Paper variant="outlined" component="li" sx={{ p: { xs: 2, sm: 2.5 }, listStyle: 'none' }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          {n}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, pt: 0.5 }}>
          <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 600, lineHeight: 1.35 }}>{step.text[lang]}</Typography>
          {step.warn && (
            <Alert severity="error" icon={<WarningAmberRoundedIcon />} sx={{ mt: 1.5, fontSize: 18, fontWeight: 600 }}>
              {step.warn[lang]}
            </Alert>
          )}
          {linked && (
            <Button
              component={RouterLink}
              to={`/guide/${linked.slug}`}
              variant="outlined"
              endIcon={<ChevronRightIcon />}
              sx={{ mt: 1.5, borderRadius: 999, fontSize: 16 }}
            >
              {UI.goTo[lang]}: {linked.title[lang]}
            </Button>
          )}
          {step.img && <Photo name={step.img} alt={step.text[lang]} />}
        </Box>
      </Stack>
    </Paper>
  )
}

function GuideDetail({ guide, lang }: { guide: Guide; lang: Lang }) {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <Button
        component={RouterLink}
        to="/guide"
        startIcon={<ArrowBackIcon />}
        size="large"
        sx={{ alignSelf: 'flex-start', borderRadius: 999, fontSize: 18 }}
      >
        {UI.menu[lang]}
      </Button>
      <Typography component="h1" sx={{ fontSize: { xs: 28, sm: 34 }, fontWeight: 750, lineHeight: 1.2 }}>
        {guide.title[lang]}
      </Typography>
      {guide.alert && (
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 32 }} />}
          sx={{ fontSize: 20, fontWeight: 700, alignItems: 'center' }}
        >
          {guide.alert[lang]}
        </Alert>
      )}
      {guide.before && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderColor: 'warning.main', borderWidth: 2 }}>
          <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
            {UI.before[lang]}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, '& li': { fontSize: 19, lineHeight: 1.5, mb: 0.5 } }}>
            {guide.before.map((b) => (
              <li key={b.en}>{b[lang]}</li>
            ))}
          </Box>
        </Paper>
      )}
      <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mt: 1 }}>
        {UI.steps[lang]}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mt: -1.5 }}>{UI.zoom[lang]}</Typography>
      <Stack component="ol" sx={{ gap: 1.5, m: 0, p: 0 }}>
        {guide.steps.map((s, i) => (
          <StepCard key={i} n={i + 1} step={s} lang={lang} />
        ))}
      </Stack>
      <Typography sx={{ fontSize: 26, fontWeight: 750, textAlign: 'center', my: 2 }}>✅ {UI.done[lang]}</Typography>
      <Button
        component={RouterLink}
        to="/guide"
        variant="contained"
        size="large"
        startIcon={<ArrowBackIcon />}
        sx={{ borderRadius: 999, fontSize: 18, py: 1.5 }}
      >
        {UI.menu[lang]}
      </Button>
    </Stack>
  )
}

function Menu({ lang }: { lang: Lang }) {
  return (
    <Stack sx={{ gap: 3 }}>
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: 30, sm: 36 }, fontWeight: 750, lineHeight: 1.2 }}>
          {UI.title[lang]}
        </Typography>
        <Typography sx={{ fontSize: 19, color: 'text.secondary', mt: 0.5 }}>{UI.pick[lang]}</Typography>
      </Box>
      {GROUPS.map((group) => (
        <Box component="section" key={group.id}>
          <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 1.25 }}>
            {group.title[lang]}
          </Typography>
          <Stack sx={{ gap: 1.25 }}>
            {GUIDES.filter((g) => g.group === group.id).map((g) => (
              <Paper
                key={g.slug}
                variant="outlined"
                component={RouterLink}
                to={`/guide/${g.slug}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.25,
                  color: 'inherit',
                  textDecoration: 'none',
                  ...(g.danger && { borderColor: 'error.main', borderWidth: 2 }),
                  '&:hover, &:focus-visible': { borderColor: g.danger ? 'error.main' : 'primary.main' },
                }}
              >
                <Box
                  component="img"
                  src={pic(g.img)}
                  alt=""
                  sx={{ width: 72, height: 72, borderRadius: 2.5, objectFit: 'cover', flexShrink: 0, bgcolor: 'action.hover' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 19, fontWeight: 650, lineHeight: 1.3 }}>{g.title[lang]}</Typography>
                  {g.danger && (
                    <Chip
                      size="small"
                      color="error"
                      icon={<WarningAmberRoundedIcon />}
                      label={UI.danger[lang]}
                      sx={{ mt: 0.75 }}
                    />
                  )}
                </Box>
                <ChevronRightIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
              </Paper>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

export default function GuidePage() {
  const { slug } = useParams()
  const [lang, setLang] = useLang()
  const guide = GUIDES.find((g) => g.slug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [guide])

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={lang}
        onChange={(_, v: Lang | null) => v && setLang(v)}
        aria-label="Language"
        sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, '& .MuiToggleButton-root': { px: 1.5, fontSize: 15, borderRadius: 999 } }}
      >
        <ToggleButton value="vi">Tiếng Việt</ToggleButton>
        <ToggleButton value="en">English</ToggleButton>
      </ToggleButtonGroup>
      {guide ? <GuideDetail guide={guide} lang={lang} /> : <Menu lang={lang} />}
    </Box>
  )
}
