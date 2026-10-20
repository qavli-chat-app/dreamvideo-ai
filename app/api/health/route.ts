import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'DreamVideo AI',
    generation: !process.env.VIDEO_PROVIDER || process.env.VIDEO_PROVIDER === 'disabled' ? 'disabled-until-provider-setup' : 'adapter-not-implemented'
  });
}