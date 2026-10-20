import { z } from 'zod';

export const generationInputSchema = z.object({
  prompt: z.string().trim().min(5).max(2000),
  negativePrompt: z.string().trim().max(1000).optional().default(''),
  mode: z.enum(['text-to-video', 'image-to-video']),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']),
  style: z.enum(['cinematic', 'animation', 'realistic', 'educational', 'futuristic']),
  durationSeconds: z.number().int().min(1).max(20)
});
export type GenerationInput = z.infer<typeof generationInputSchema>;
export type ProviderJob = { providerJobId: string; status: 'queued' | 'processing' | 'completed' | 'failed'; videoUrl?: string; error?: string };
export interface VideoProvider {
  createJob(input: GenerationInput): Promise<ProviderJob>;
  getJob(providerJobId: string): Promise<ProviderJob>;
}
export class ProviderNotConfiguredError extends Error {
  constructor() { super('Video generation is not configured yet. No video has been generated.'); }
}
export function getVideoProvider(): VideoProvider {
  const provider = process.env.VIDEO_PROVIDER;
  if (!provider || provider === 'disabled') throw new ProviderNotConfiguredError();
  throw new Error('The selected provider has no tested adapter. Generation remains disabled.');
}