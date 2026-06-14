import { AuditLogger, InMemoryAuditStore } from './auditLogger';

describe('audit chain (integration)', () => {
  it('builds a valid tamper-evident chain and detects tampering', async () => {
    const store = new InMemoryAuditStore();
    const logger = new AuditLogger(store, 'test-bucket');
    const base = Date.now();
    for (let i = 0; i < 10; i++) {
      await logger.log({
        timestamp: base + i,
        actor: { uid: `u${i}`, email: 'a@b.c', ip: '127.0.0.1', userAgent: 't' },
        action: 'ACCESS',
        resource: `r/${i}`,
        outcome: 'SUCCESS',
      });
    }
    const ok = await logger.verifyChain(5);
    expect(ok.valid).toBe(true);
    expect(ok.checked).toBe(10);

    store.events[4].resource = 'r/HACKED';
    const bad = await logger.verifyChain(5);
    expect(bad.valid).toBe(false);
    expect(bad.breakAt).toBeDefined();
  });

  it('reports an empty ledger as valid with zero checked', async () => {
    const logger = new AuditLogger(new InMemoryAuditStore(), 'test-bucket');
    const res = await logger.verifyChain();
    expect(res.valid).toBe(true);
    expect(res.checked).toBe(0);
  });
});
