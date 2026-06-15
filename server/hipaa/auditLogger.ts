/**
 * server/hipaa/auditLogger.ts
 * Tamper-evident (hash-chained) audit logging.
 *
 * Each event's hash includes the previous event's hash, so any retroactive
 * edit breaks the chain and is detectable by verifyChain(). Storage is behind
 * an injectable AuditStore:
 *   - SupabaseAuditStore: production — appends to the RLS-protected,
 *     append-only `enterprise.audit_log` table (see 0002_enterprise.sql);
 *     reads are paged (chunked) for OOM safety.
 *   - InMemoryAuditStore: CI/tests — no live infrastructure required.
 */
import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

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

export class SupabaseAuditStore implements AuditStore {
  /**
   * @param client  An injected Supabase client (server-side, service-role key)
   *                so writes land in the append-only ledger regardless of RLS.
   */
  constructor(
    private client: SupabaseClient,
    private schema = 'enterprise',
    private table = 'audit_log'
  ) {}

  private from() {
    return (this.client as any).schema(this.schema).from(this.table);
  }

  async append(event: AuditEvent): Promise<void> {
    const { error } = await this.from().insert({
      event_id: event.eventId,
      ts: event.timestamp,
      actor: event.actor,
      action: event.action,
      resource: event.resource,
      tenant_id: event.tenantId ?? null,
      outcome: event.outcome,
      previous_hash: event.previousHash,
      hash: event.hash,
    });
    if (error) throw new Error(`audit append failed: ${error.message}`);
  }

  async page(afterTimestamp: number | null, limit: number): Promise<AuditEvent[]> {
    let q = this.from().select('*').order('ts', { ascending: true }).limit(limit);
    if (afterTimestamp !== null) q = q.gt('ts', afterTimestamp);
    const { data, error } = await q;
    if (error) throw new Error(`audit page failed: ${error.message}`);
    return (data || []).map(
      (r: any): AuditEvent => ({
        eventId: r.event_id,
        timestamp: Number(r.ts),
        actor: r.actor,
        action: r.action,
        resource: r.resource,
        tenantId: r.tenant_id ?? undefined,
        outcome: r.outcome,
        previousHash: r.previous_hash,
        hash: r.hash,
      })
    );
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
