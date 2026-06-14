/**
 * server/tests/backupVerification.ts
 * Exercises the tamper-evident audit chain end-to-end with an in-memory store
 * (no live infrastructure): builds a chain, verifies it, then tampers with a
 * record and confirms the break is detected. Exit 0 only if both hold.
 */
import { AuditLogger, InMemoryAuditStore } from '../hipaa/auditLogger';

async function verifyBackupPipeline() {
  console.log('🚀 Chronological audit-chain diagnostics...');
  const store = new InMemoryAuditStore();
  const logger = new AuditLogger(store, 'mock-audit-bucket-14');

  const base = Date.now();
  for (let i = 0; i < 25; i++) {
    await logger.log({
      timestamp: base + i,
      actor: { uid: `u${i}`, email: 'actor@example.com', ip: '127.0.0.1', userAgent: 'probe' },
      action: 'AUDIT_TEST_EVENT',
      resource: `resource/${i}`,
      outcome: 'SUCCESS',
    });
  }

  const result = await logger.verifyChain(100);
  if (!result.valid) {
    console.error(`❌ FAILURE: clean chain reported invalid at ${result.breakAt}`);
    process.exit(1);
  }
  console.log(`Verified ${result.checked} chained audit blocks.`);

  // Tamper with a middle record; the chain must now break.
  store.events[10].action = 'TAMPERED_ACTION';
  const tampered = await logger.verifyChain(100);
  if (tampered.valid) {
    console.error('❌ FAILURE: tamper-evident chain did NOT detect modification.');
    process.exit(1);
  }

  console.log(`🟢 BACKUP/INTEGRITY PASSED: chain verified, and tampering detected at ${tampered.breakAt}.`);
  process.exit(0);
}

verifyBackupPipeline().catch((e) => {
  console.error('❌ FAILURE: unexpected error:', e);
  process.exit(1);
});
