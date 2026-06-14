import { FallbackProvider } from './FallbackProvider';
import type { LLMProvider } from './LLMProvider';

function makeFakeDb() {
  const store = new Map<string, any>();
  const makeRef = (col: string, id: string) => ({
    get: async () => ({ exists: store.has(`${col}/${id}`), data: () => store.get(`${col}/${id}`) }),
    set: async (v: any) => { store.set(`${col}/${id}`, v); },
  });
  return {
    _store: store,
    collection: (col: string) => ({ doc: (id: string) => makeRef(col, id) }),
    runTransaction: async (fn: any) =>
      fn({ get: (ref: any) => ref.get(), set: (ref: any, v: any) => ref.set(v) }),
  } as any;
}

const ok = (name: string, priority: number): LLMProvider => ({
  name, priority,
  generate: jest.fn(async () => ({ text: 'ok', provider: name, latency: 1, tokensUsed: 1 })),
});
const fail = (name: string, priority: number): LLMProvider => ({
  name, priority,
  generate: jest.fn(async () => { throw new Error('boom'); }),
});
const hang = (name: string, priority: number): LLMProvider => ({
  name, priority,
  generate: jest.fn(() => new Promise<never>(() => {})),
});

const req = { systemInstruction: 's', userInput: 'u', maxTokens: 10, temperature: 0 };

describe('FallbackProvider', () => {
  it('returns the highest-priority provider on success', async () => {
    const fp = new FallbackProvider([ok('b', 2), ok('a', 1)], makeFakeDb());
    const res = await fp.generate(req);
    expect(res.provider).toBe('a');
  });

  it('falls over to the next provider on failure', async () => {
    const p1 = fail('p1', 1);
    const p2 = ok('p2', 2);
    const fp = new FallbackProvider([p1, p2], makeFakeDb());
    const res = await fp.generate(req);
    expect(res.provider).toBe('p2');
    expect(p1.generate).toHaveBeenCalledTimes(1);
  });

  it('throws ALL_PROVIDERS_FAILED when everything fails', async () => {
    const fp = new FallbackProvider([fail('p1', 1), fail('p2', 2)], makeFakeDb());
    await expect(fp.generate(req)).rejects.toThrow('ALL_PROVIDERS_FAILED');
  });

  it('opens the circuit after the failure threshold and then skips the provider', async () => {
    const p = fail('flaky', 1);
    const fp = new FallbackProvider([p], makeFakeDb());
    for (let i = 0; i < 4; i++) {
      await fp.generate(req).catch(() => undefined);
    }
    // 3 attempts before the circuit opened; the 4th was skipped.
    expect(p.generate).toHaveBeenCalledTimes(3);
  });

  it('skips a provider whose circuit is already open', async () => {
    const db = makeFakeDb();
    db._store.set('llmCircuitBreaker/p1', { failures: 5, lastFailure: Date.now(), open: true, openedAt: Date.now() });
    const p1 = ok('p1', 1);
    const fp = new FallbackProvider([p1], db);
    await expect(fp.generate(req)).rejects.toThrow('ALL_PROVIDERS_FAILED');
    expect(p1.generate).not.toHaveBeenCalled();
  });

  it('resets the circuit after the timeout window elapses', async () => {
    const db = makeFakeDb();
    db._store.set('llmCircuitBreaker/p1', { failures: 5, lastFailure: 0, open: true, openedAt: Date.now() - 400000 });
    const p1 = ok('p1', 1);
    const fp = new FallbackProvider([p1], db);
    const res = await fp.generate(req);
    expect(res.provider).toBe('p1');
  });

  it('times out a hung provider and falls over', async () => {
    const fp = new FallbackProvider([hang('slow', 1), ok('fast', 2)], makeFakeDb(), 50);
    const res = await fp.generate(req);
    expect(res.provider).toBe('fast');
  });
});
