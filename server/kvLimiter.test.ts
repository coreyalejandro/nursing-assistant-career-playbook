import { windowKey, readCount, incrementCount, kvRateLimit, type KVNamespace } from './kvLimiter';

function makeKV(): KVNamespace & { _store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    _store: store,
    async get(k) { return store.has(k) ? store.get(k)! : null; },
    async put(k, v) { store.set(k, v); },
  };
}

describe('windowKey', () => {
  it('is stable within a window and changes across windows', () => {
    const base = 1_020_000; // aligned to a 60s window start (1020s)
    const a = windowKey('rl', 'ip1', 60, base);
    const b = windowKey('rl', 'ip1', 60, base + 59_000); // same window
    const c = windowKey('rl', 'ip1', 60, base + 61_000); // next window
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe('readCount / incrementCount', () => {
  it('reads 0 when missing and increments persistently', async () => {
    const kv = makeKV();
    expect(await readCount(kv, 'k')).toBe(0);
    expect(await incrementCount(kv, 'k', 60)).toBe(1);
    expect(await incrementCount(kv, 'k', 60)).toBe(2);
    expect(await readCount(kv, 'k')).toBe(2);
  });
});

describe('kvRateLimit', () => {
  it('allows up to the limit then blocks', async () => {
    const kv = makeKV();
    const now = 5_000_000;
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await kvRateLimit(kv, 'ip', 3, 60, now));
    expect(results.map(r => r.allowed)).toEqual([true, true, true, false]);
    expect(results[2].remaining).toBe(0);
    expect(results[3].count).toBe(4);
  });

  it('resets in a new window', async () => {
    const kv = makeKV();
    const first = await kvRateLimit(kv, 'ip', 1, 60, 1_000_000);
    const blocked = await kvRateLimit(kv, 'ip', 1, 60, 1_000_000);
    const nextWindow = await kvRateLimit(kv, 'ip', 1, 60, 1_000_000 + 61_000);
    expect(first.allowed).toBe(true);
    expect(blocked.allowed).toBe(false);
    expect(nextWindow.allowed).toBe(true);
  });
});
