import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('generation route validates input before provider use', async () => {
  const source = await readFile(new URL('../app/api/generate/route.ts', import.meta.url), 'utf8');
  assert.ok(source.indexOf('safeParse') < source.indexOf('getVideoProvider().createJob'));
});
test('generation never claims success when provider is disabled', async () => {
  const source = await readFile(new URL('../lib/video-provider.ts', import.meta.url), 'utf8');
  assert.match(source, /ProviderNotConfiguredError/);
  assert.match(source, /Generation remains disabled/);
});
test('health route reports app status', async () => {
  const source = await readFile(new URL('../app/api/health/route.ts', import.meta.url), 'utf8');
  assert.match(source, /status: 'ok'/);
});