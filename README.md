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

1. Push this folder as its own repo and import it in Netlify. `netlify.toml` already sets
   the build command (`npm run build`), the publish folder (`dist`), and the SPA redirect,
   so links like `/pond/devices/...` still work after a page refresh.
2. In **Site configuration → Environment variables**, add
   `VITE_API_URL = https://pond-api-xxxxxxxx-uw.a.run.app` (your Cloud Run URL, no trailing slash).
3. Deploy. Then add your Netlify URL to `CORS_ORIGINS` on the API, or the browser will
   block the requests.

`VITE_API_URL` is baked in at build time, so if you change it, trigger a new Netlify deploy.
