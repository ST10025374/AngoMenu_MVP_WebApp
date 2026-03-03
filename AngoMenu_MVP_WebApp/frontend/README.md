# AngoMenu Frontend (Starter)

This frontend is now initialized to call the AngoMenu backend for:

- Login (`POST /api/auth/login`)
- Restaurants listing (`GET /api/restaurants`)
- Public menu listing by restaurant (`GET /api/menu/restaurant/{id}`)

## Run locally

```bash
npm install
npm run dev
```

## API base URL

By default, the app uses:

https://localhost:7210

You can override it with a Vite env variable:

```bash
VITE_API_BASE_URL=https://localhost:7210

Or create a local `.env` file:

```env
VITE_API_BASE_URL=https://localhost:7210
