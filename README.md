# Outbreak dashboard

The dashboard loads its COVID-19 time series from `GET /api/covid`. The endpoint
must return a JSON array with the same fields and values as the former
`src/data/covid.json` file.

## Development

Start the frontend:

```sh
npm install
npm run dev
```

During development, Vite proxies `/api` requests to `http://127.0.0.1:3000` by
default. Set `API_PROXY_TARGET` in a local `.env` file to use a different local
backend origin. To use the hosted API while developing, set
`VITE_API_BASE_URL=https://outbreak-backend-t2wx.onrender.com`.

Production builds use `https://outbreak-backend-t2wx.onrender.com` by default.
Set `VITE_API_BASE_URL` at build time to use a different API origin. The API
must allow cross-origin requests from the frontend. The hosted API currently
allows `http://localhost:5173`; add your deployed frontend origin to its CORS
configuration before deploying the frontend.

## Render deployment

The Render static site must run `npm ci && npm run build` and publish `dist`.
The included `render.yaml` configures these settings for a Render Blueprint.
For a static site created directly in the Render dashboard, set the build
command and publish directory to the same values, then redeploy. Publishing
the repository root serves the unbuilt `/src/main.tsx` entry and misses the
copied public assets such as `/favicon.svg`.

The frontend validates the response shape and displays loading, fetch, and
invalid-data states; the retry button requests the endpoint again.
