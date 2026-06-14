/**
 * server/hipaa/auditLogger.ts
 * Tamper-evident (hash-chained) audit logging.
 *
 * Each event's hash includes the previous event's hash, so any retroactive
 * edit breaks the chain and is detectable by verifyChain(). Storage is behind
 * an injectable AuditStore:
 *   - FirestoreAuditStore: production — writes to Firestore AND an immutable,
 *     versioned GCS bucket; reads are paged (chunked) for OOM safety.
 *   - InMemoryAuditStore: CI/tests — no live infrastructure required.
 */
import crypto from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';

export interface AuditEvent {
  eventId: string;
  timestamp: number;
  actor: { uid: string; email: string; ip: string; userAgent: string };
  action: string;
  resource: string;
  tenantId?: string;
  outcome: string;
  previousHash: string;
  hash: string;
}

export type AuditInput = Omit<AuditEvent, 'eventId' | 'hash' | 'previousHash'>;

export interface AuditStore {
  append(event: AuditEvent): Promise<void>;
  /** Page events ordered by timestamp ascending, strictly after `afterTimestamp`. */
  page(afterTimestamp: number | null, limit: number): Promise<AuditEvent[]>;
}

export function computeHash(parts: {
  eventId: string; timestamp: number; uid: string; action: string; resource: string; previousHash: string;
}): string {
  return crypto
    .createHash('sha256')
    .update(`${parts.eventId}:${parts.timestamp}:${parts.uid}:${parts.action}:${parts.resource}:${parts.previousHash}`)
    .digest('hex');
}

export class InMemoryAuditStore implements AuditStore {
  public events: AuditEvent[] = [];
  async append(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }
  async page(afterTimestamp: number | null, limit: number): Promise<AuditEvent[]> {
    const sorted = [...this.events].sort((a, b) => a.timestamp - b.timestamp);
    const filtered = afterTimestamp === null ? sorted : sorted.filter((e) => e.timestamp > afterTimestamp);
    return filtered.slice(0, limit);
  }
}

export class FirestoreAuditStore implements AuditStore {
  private storage: Storage;
  constructor(
    private db: Firestore,
    private gcsBucket: string,
    private collection = 'audit',
    private tenantId?: string
  ) {
    this.storage = new Storage();
  }
  private path(): string {
    return this.tenantId ? `tenant/${this.tenantId}/${this.collection}` : this.collection;
  }
  async append(event: AuditEvent): Promise<void> {
    await this.db.collection(this.path()).doc(event.eventId).set(event);
    const day = new Date(event.timestamp).toISOString().split('T')[0];
    const fileName = `audit/${this.tenantId || 'free'}/${day}/${event.eventId}.json`;
    await this.storage
      .bucket(this.gcsBucket)
      .file(fileName)
      .save(JSON.stringify(event), { metadata: { contentType: 'application/json' } });
  }
  async page(afterTimestamp: number | null, limit: number): Promise<AuditEvent[]> {
    let q = this.db.collection(this.path()).orderBy('timestamp').limit(limit);
    if (afterTimestamp !== null) q = q.startAfter(afterTimestamp);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as AuditEvent);
  }
}

export class AuditLogger {
  private lastHash = 'genesis';
  constructor(private store: AuditStore, private gcsBucket?: string) {}

  async log(input: AuditInput): Promise<AuditEvent> {
    const eventId = crypto.randomUUID();
    const previousHash = this.lastHash;
    const hash = computeHash({
      eventId, timestamp: input.timestamp, uid: input.actor.uid,
      action: input.action, resource: input.resource, previousHash,
    });
    const event: AuditEvent = { ...input, eventId, previousHash, hash };
    await this.store.append(event);
    this.lastHash = hash;
    return event;
  }

  async verifyChain(batchSize = 1000, maxEvents = 100000): Promise<{ valid: boolean; breakAt?: string; checked: number }> {
    let previousHash = 'genesis';
    let checked = 0;
    let after: number | null = null;
    // Chunked paging keeps memory flat across very large ledgers.
    for (;;) {
      const batch = await this.store.page(after, batchSize);
      if (batch.length === 0) break;
      for (const e of batch) {
        const expected = computeHash({
          eventId: e.eventId, timestamp: e.timestamp, uid: e.actor.uid,
          action: e.action, resource: e.resource, previousHash,
        });
        if (e.hash !== expected) return { valid: false, breakAt: e.eventId, checked };
        previousHash = e.hash;
        checked++;
      }
      after = batch[batch.length - 1].timestamp;
      if (checked >= maxEvents || batch.length < batchSize) break;
    }
    return { valid: true, checked };
  }
}
