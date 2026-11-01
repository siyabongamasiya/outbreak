# Outbreak

Outbreak is a COVID-19 dashboard for exploring South Africa's first 100 days of
the outbreak, from 5 March to 12 June 2020. It displays case totals and trends
from the project's COVID-19 time-series dataset. The dashboard is built with
React, TypeScript, Vite, and Recharts.

## Live Services

- Frontend: [outbreak-wala.onrender.com](https://outbreak-wala.onrender.com)
- Backend API: [outbreak-backend-t2wx.onrender.com](https://outbreak-backend-t2wx.onrender.com)
- Data endpoint: [GET /api/covid](https://outbreak-backend-t2wx.onrender.com/api/covid)

## Dashboard Features

- Summary cards for confirmed, active, recovered, and death totals.
- Charts for cumulative confirmed cases, daily new cases, deaths versus
  recoveries, and active cases.
- All-time and most-recent-30-days date ranges.
- Latest total and highest daily rise indicators.
- Loading, fetch-error, and invalid-data states, with a retry action.

## Data API

The frontend loads its COVID-19 time series from `GET /api/covid`. The endpoint
must return a JSON array with at least two records, using the same fields and
values as [`src/data/covid.json`](src/data/covid.json):

- `Date`
- `Total Confirmed Cases`
- `Total Deaths`
- `Total Recovered`
- `Active Cases`
- `Daily Confirmed Cases`
- `Daily  deaths` (the field name contains two spaces)

The frontend validates the response and numeric values before rendering the
charts. The API must allow cross-origin requests from the deployed frontend
origin (`https://outbreak-wala.onrender.com`).

## Development

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Vite proxies `/api` requests to `http://127.0.0.1:3000` by default. To use a
different local backend, set `API_PROXY_TARGET` in a local `.env` file. To use
the hosted backend during development, set:

```env
VITE_API_BASE_URL=https://outbreak-backend-t2wx.onrender.com
```

Production builds use the hosted backend by default. Set
`VITE_API_BASE_URL` at build time to use a different API origin.

Available scripts:

```sh
npm run dev      # Start the development server
npm run build    # Create the production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Render Deployment

The frontend is a Render static site. Configure it to run `npm ci && npm run
build` and publish `dist`. The included [`render.yaml`](render.yaml) provides
this configuration for a Render Blueprint. For a static site created directly
in the Render dashboard, use the same build command and publish directory.
