# DreamVideo AI

Mobile-first Next.js workspace for planning AI video generations. This repository is a scaffold, not a complete production AI video service.

## Current status
- Responsive prompt composer and dark violet UI.
- Validated generation API contract and health endpoint.
- Provider boundary fails closed; no fake jobs or videos are returned.
- Authentication, PostgreSQL persistence, secure storage, queue/worker, credits, admin authorization, and a tested provider adapter are not yet implemented.

## Run locally
Requires Node.js 20.9+ and npm:
```sh
npm install
cp .env.example .env.local
npm test
npm run dev
```
Open http://localhost:3000 and check /api/health.

## Important
Keep `VIDEO_PROVIDER=disabled` until a documented, tested provider adapter is installed. Do not expose the generation endpoint to public traffic yet: authentication, authorization, rate limits, durable jobs, credits, and secure uploads are not present. Never commit secrets. Free hosting does not imply free GPU inference or unlimited generation.