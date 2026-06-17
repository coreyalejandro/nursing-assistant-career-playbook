import { decide, checkAndCount, upgradePayload, FREE_DAILY_AI_LIMIT } from './freemium';
import type { KVNamespace as KV } from './kvLimiter';

function makeKV(): KV {
  const store = new Map<string, string>();
  return {
    async get(k) { return store.has(k) ? store.get(k)! : null; },
    async put(k, v) { store.set(k, v); },
  };
}

describe('decide (pure)', () => {
  it('allows a free user under the limit', () => {
    const d = decide('free', 3);
    expect(d.allowed).toBe(true);
    expect(d.limit).toBe(FREE_DAILY_AI_LIMIT);
    expect(d.remaining).toBe(FREE_DAILY_AI_LIMIT - 3);
  });
  it('blocks a free user at the limit', () => {
    const d = decide('free', FREE_DAILY_AI_LIMIT);
    expect(d.allowed).toBe(false);
    expect(d.remaining).toBe(0);
  });
  it('always allows pro with infinite remaining', () => {
    const d = decide('pro', 9999);
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(Infinity);
  });
});

describe('checkAndCount (KV-backed)', () => {
  it('gives a free user exactly FREE_DAILY_AI_LIMIT calls, then blocks', async () => {
    const kv = makeKV();
    const now = 7_000_000_000;
    const outcomes: boolean[] = [];
    for (let i = 0; i < FREE_DAILY_AI_LIMIT + 2; i++) {
      outcomes.push((await checkAndCount(kv, 'sess1', 'free', now)).allowed);
    }
    const allowedCount = outcomes.filter(Boolean).length;
    expect(allowedCount).toBe(FREE_DAILY_AI_LIMIT);
    expect(outcomes[FREE_DAILY_AI_LIMIT]).toBe(false); // 11th blocked
  });

  it('never counts pro users', async () => {
    const kv = makeKV();
    for (let i = 0; i < 50; i++) {
      const d = await checkAndCount(kv, 'sessPro', 'pro');
      expect(d.allowed).toBe(true);
    }
  });

  it('resets usage on a new day window', async () => {
    const kv = makeKV();
    const day1 = 1_000_000_000_000;
    for (let i = 0; i < FREE_DAILY_AI_LIMIT; i++) await checkAndCount(kv, 's', 'free', day1);
    const blocked = await checkAndCount(kv, 's', 'free', day1);
    const day2 = day1 + 24 * 60 * 60 * 1000 + 1000;
    const fresh = await checkAndCount(kv, 's', 'free', day2);
    expect(blocked.allowed).toBe(false);
    expect(fresh.allowed).toBe(true);
  });
});

describe('upgradePayload', () => {
  it('returns a structured 402 body with the upgrade url', () => {
    const d = decide('free', FREE_DAILY_AI_LIMIT);
    const body = upgradePayload(d, 'https://buy.stripe.com/test');
    expect(body.code).toBe('FREE_LIMIT_REACHED');
    expect(body.upgradeUrl).toBe('https://buy.stripe.com/test');
    expect(body.success).toBe(false);
  });
});
