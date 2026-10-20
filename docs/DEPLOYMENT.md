# Deployment checklist

## Free preview deployment
Use a free web-service instance and verify its current plan and usage limits before creating resources. Free instances can sleep and may have ephemeral filesystems. Do not add a payment method or upgrade a plan to complete this preview.

Build command: `npm install --no-audit --no-fund && npm run build`
Start command: `npm start`
Environment: `VIDEO_PROVIDER=disabled`

After deployment, verify:
- `/` loads on mobile and desktop.
- `/api/health` returns JSON with `status: "ok"`.
- Invalid generation requests return HTTP 400.
- Valid requests return HTTP 503 with `PROVIDER_NOT_CONFIGURED` while the provider is disabled.

## Production blockers
This is not a complete video-generation service. Before public generation, implement and test user authentication, server-side authorization, PostgreSQL schema and migrations, durable jobs/worker, secure object storage, upload validation, rate limits, idempotency, atomic credit ledger, admin roles, deletion/retention, and a documented provider adapter. No provider is assumed to be free or unlimited. Never return mock URLs or claim a video is generated when it is not.
