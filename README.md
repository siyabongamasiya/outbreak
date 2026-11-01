# Outbreak dashboard

The dashboard loads its COVID-19 time series from `GET /api/covid`. The endpoint
must return a JSON array with the same fields and values as the former
`src/data/covid.json` file.

## Development

Run the Express API on port `3000`, then start the frontend:

```sh
npm install
npm run dev
```

Vite proxies `/api` requests to `http://127.0.0.1:3000` by default. Set
`API_PROXY_TARGET` in a local `.env` file to use a different backend origin.

For a deployed API on a different origin, set `VITE_API_BASE_URL` to its base
URL (for example, `https://api.example.com`). The API must allow cross-origin
requests from the frontend.

The frontend validates the response shape and displays loading, fetch, and
invalid-data states; the retry button requests the endpoint again.
