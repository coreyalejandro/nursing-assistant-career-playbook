import { resolvePlan } from './entitlement';

afterEach(() => { delete (global as any).fetch; });

describe('resolvePlan', () => {
  it('returns free when there is no auth header', async () => {
    expect(await resolvePlan(null, { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'k' })).toBe('free');
  });

  it('returns free when Supabase is not configured', async () => {
    expect(await resolvePlan('Bearer jwt', {})).toBe('free');
  });

  it('returns pro when the profile row says pro', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ plan: 'pro' }] });
    const plan = await resolvePlan('Bearer jwt', { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' });
    expect(plan).toBe('pro');
    const [url, init] = (global as any).fetch.mock.calls[0];
    expect(url).toContain('/rest/v1/profiles?select=plan');
    expect(init.headers.Authorization).toBe('Bearer jwt');
    expect(init.headers.apikey).toBe('anon');
  });

  it('defaults to free when the profile row is not pro', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ plan: 'free' }] });
    expect(await resolvePlan('Bearer jwt', { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })).toBe('free');
  });

  it('fails closed to free on a non-OK response', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    expect(await resolvePlan('Bearer jwt', { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })).toBe('free');
  });

  it('fails closed to free when fetch throws', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));
    expect(await resolvePlan('Bearer jwt', { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })).toBe('free');
  });
});
