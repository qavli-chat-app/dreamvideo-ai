# DreamVideo AI

Mobile-first Next.js workspace for a real text-to-video app, with a free-hosting path and an experimental open-source video-model backend.

## Current status — read before using

- The Next.js UI and request validation are in GitHub.
- A Hugging Face Space backend template is in `hf-space/`.
- **No production deployment has been verified yet.**
- **Real video generation is not yet wired end-to-end or verified.** Do not treat the current web UI as a completed generator.
- Free GPU services have queues and quotas; no free service guarantees unlimited generation.

## Free deployment path

1. Web UI: use the Vercel Hobby plan and keep it free. Open [Import DreamVideo AI to Vercel](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fqavli-chat-app%2Fdreamvideo-ai). Do not start a paid trial or enter billing details.
2. Video backend experiment: see [hf-space/README.md](hf-space/README.md). The Space must be created in an account that has access to compatible free GPU hardware, and it may fail or queue when free quota is exhausted.
3. Deployment walkthrough: [docs/VERCEL-DEPLOYMENT.md](docs/VERCEL-DEPLOYMENT.md).

The web host does not provide video-model GPU compute. The Hugging Face Space template is experimental and has not been deployed or load-tested from this repository.

## Run locally

Requires Node.js 20.9+ and npm:

```sh
npm install
cp .env.example .env.local
npm test
npm run dev
```

Open http://localhost:3000 and check /api/health.

## Security and cost

Keep `VIDEO_PROVIDER=disabled` until a documented, tested provider adapter is installed. Authentication, authorization, rate limits, durable job storage, user credits, admin controls, and secure uploads are not implemented. Never commit API tokens. Never enable a paid GPU or paid inference provider if keeping the project free-only is mandatory.
