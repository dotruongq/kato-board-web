# pond-web

React + MUI dashboard for `pond-api`. Deployed to Netlify.

```
src/
  main.tsx                    # theme + router
  app/AppLayout.tsx           # top bar + side nav (built from the feature registry)
  app/theme.ts                # follows the device's light/dark setting
  lib/                        # API client, polling hook, formatters
  features/
    registry.tsx              # list of features: nav entry + routes
    pond/
      api.ts types.ts metrics.ts
      pages/PondDashboardPage.tsx   # /pond: every device, a card per metric with 24h sparkline + change
      pages/DeviceDetailPage.tsx    # /pond/devices/:id?metric=ph&range=7d: area chart vs previous period
      components/                   # MetricCard, Sparkline, MetricChart, DeviceSection, Freshness
```

To add a feature: create `src/features/<name>/` with its pages, then add one entry to
`FEATURES` in `src/features/registry.tsx`. It shows up in the nav automatically.

## Login

The whole app sits behind **Sign in with Google** (Firebase Authentication, free plan, project
`kato-board`). A device stays signed in until **Sign out** (bottom of the side menu); Firebase
renews the token in the background. The API decides who gets in (its `ALLOWED_EMAILS`); any
other Google account sees "isn't allowed". Code: `src/lib/firebase.ts`, `src/app/auth.tsx`,
and `src/lib/api.ts` (adds the token to every request).

## Always-on screen

While open, the page keeps the display awake (Wake Lock) and checks `/version.json` every
5 minutes; after a new deploy it reloads itself (`src/lib/useScreenAlwaysOn.ts`).

## Colours

Card and chart colours follow each metric's direction over the **last 2 hours** (computed by the API).
Every colour also has a word label on the card, so it never relies on colour alone.

| Metric | Falling | Steady | Rising |
| --- | --- | --- | --- |
| pH | green | blue | orange above 8.35, otherwise blue |
| Temp | blue | neutral | orange |
| TDS | neutral | neutral | neutral |

The rules and the 8.35 threshold live in `metricTone()` in `src/features/pond/metrics.ts`. What counts as
"steady" (pH ±0.03, temp ±0.3 °C over 2h) is `FLAT_CHANGE` in `pond-api/src/features/pond/service.py`.

The moon/sun button next to **Kato Board** switches night mode; the choice is saved per browser.
The pill on the right of the top bar shows weather (°F | °C) and local time for ZIP 92801
(`src/features/weather/WeatherChip.tsx`; the location is set on the API with `WEATHER_*` env vars).

Next to it, the alerts chip shows how many pond weather alerts are coming up in the next 7 days
(rain, cold or freezing nights, heat, sharp temperature swings), coloured by the most serious one,
or "All clear". Click it for the details and a 7-day forecast strip. On phones, the alerts chip
and the weather pill move to a row just under the top bar. The rules live in the API (see the pond-api README).

## What you'll see when something breaks

| Situation | Dashboard | Chart page |
| --- | --- | --- |
| Sync bot stopped | Red **Offline** chip, values and sparklines greyed with "LAST KNOWN", the sparkline caption reads "Stopped 2h ago", alert with how long ago | Line stops; the missing time is hatched red and listed under "Sync gaps" |
| Bot running, sensor frozen | Same Offline treatment, with a message that the device reading is stale | Same |
| Short delay (10–30 min) | Amber **Delayed** chip and alert; values stay in colour | Gap hatched if 10 min or longer |
| API unreachable | Banner: "Can't reach the API. Everything below is from X ago" | Same banner, last chart kept |

"Synced X ago" keeps counting in the browser even if the API is down, and the page refetches
whenever you come back to the tab.

## Run locally

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8080
npm install
npm run dev              # http://localhost:5173
```

Start `pond-api` first (`docker compose up` in that folder).

## Deploy to Netlify

**Auto-deploy is on:** every push to `main` on GitHub (`dotruongq/kato-board-web`) builds and
publishes https://kato-board.netlify.app. The `VITE_*` values live in the Netlify site's
environment variables, so nothing else is needed. An open dashboard picks up the new version
within 5 minutes on its own.

This repo is public on purpose: Netlify's free plan only auto-builds private repos for
recognized team members. Nothing secret lives here - the Firebase values are public
identifiers, and the allowed-email list and database credentials live only in the private
API repo and Google Secret Manager.

First-time setup, for reference:

1. Push this folder as its own repo and import it in Netlify. `netlify.toml` already sets
   the build command (`npm run build`), the publish folder (`dist`), and the SPA redirect,
   so links like `/pond/devices/...` still work after a page refresh.
2. In **Site configuration → Environment variables**, add `VITE_API_URL` (your Cloud Run URL,
   no trailing slash) and the four `VITE_FIREBASE_*` values from `.env.example`.
3. Deploy. Then:
   - add your Netlify URL to `CORS_ORIGINS` on the API, or the browser will block the requests;
   - in Firebase console → Authentication → Settings → **Authorized domains**, add the Netlify
     domain, or Google sign-in will refuse to open there.

`VITE_*` values are baked in at build time, so if you change one, trigger a new Netlify deploy.
