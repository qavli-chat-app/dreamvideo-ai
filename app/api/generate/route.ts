import { NextResponse } from 'next/server';
import { generationInputSchema, getVideoProvider, ProviderNotConfiguredError } from '@/lib/video-provider';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }); }
  const parsed = generationInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid generation request.', details: parsed.error.flatten() }, { status: 400 });
  try {
    const job = await getVideoProvider().createJob(parsed.data);
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) return NextResponse.json({ error: error.message, code: 'PROVIDER_NOT_CONFIGURED' }, { status: 503 });
    console.error('Generation provider request failed');
    return NextResponse.json({ error: 'The generation provider could not accept this job.' }, { status: 502 });
  }
}