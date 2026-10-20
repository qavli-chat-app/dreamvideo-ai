# Free web deployment (Vercel)

DreamVideo AI is a Next.js application. Vercel's Hobby plan supports personal projects at no charge within its current usage limits, but that deploy only hosts the web application; it does not supply the GPU needed for video generation.

1. Open this import link while signed in to Vercel: https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fqavli-chat-app%2Fdreamvideo-ai
2. Import `qavli-chat-app/dreamvideo-ai` from GitHub.
3. Keep the Hobby/free plan. Do not start a paid trial or enter a payment method.
4. Use the detected Next.js build settings.
5. Deploy and verify the homepage and `/api/health`.

The generation endpoint will remain unavailable until a real, reachable video backend is configured and tested. The optional `hf-space/` folder is an experimental backend template, not a deployed or verified service. Free GPU availability is limited and is not guaranteed.
