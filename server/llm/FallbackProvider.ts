/**
 * server/llm/FallbackProvider.ts
 * Priority-ordered multi-provider fallback with a Firestore-backed circuit
 * breaker. State lives in Firestore (not in-process) so it survives serverless
 * cold starts / instance churn on Cloud Run.
 *
 * `db` is injected (a firebase-admin Firestore, or any compatible shape) so the
 * logic is unit-testable with an in-memory fake — see FallbackProvider.test.ts.
 */
import type { Firestore } from 'firebase-admin/firestore';
import type { LLMProvider, GenerationRequest, GenerationResponse } from './LLMProvider';

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  open: boolean;
  openedAt?: number | null;
}

export class FallbackProvider {
  private providers: LLMProvider[];
  private db: Firestore;
  private readonly CIRCUIT_THRESHOLD = 3;
  private readonly CIRCUIT_TIMEOUT_MS = 300000;
  private PROVIDER_TIMEOUT_MS = 5000;
  private readonly COLLECTION = 'llmCircuitBreaker';

  constructor(providers: LLMProvider[], db: Firestore, timeoutMs?: number) {
    this.providers = [...providers].sort((a, b) => a.priority - b.priority);
    this.db = db;
    if (typeof timeoutMs === 'number') this.PROVIDER_TIMEOUT_MS = timeoutMs;
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    let lastError: unknown = null;
    for (const provider of this.providers) {
      if (await this.isCircuitOpen(provider.name)) continue;
      try {
        const response = await this.executeWithTimeout(provider, request, this.PROVIDER_TIMEOUT_MS);
        await this.recordSuccess(provider.name);
        return response;
      } catch (error) {
        lastError = error;
        await this.recordFailure(provider.name);
      }
    }
    throw new Error('ALL_PROVIDERS_FAILED' + (lastError ? `: ${(lastError as Error).message}` : ''));
  }

  private async isCircuitOpen(providerName: string): Promise<boolean> {
    const doc = await (this.db as any).collection(this.COLLECTION).doc(providerName).get();
    if (!doc.exists) return false;
    const state = doc.data() as CircuitBreakerState;
    if (!state.open) return false;
    if (state.openedAt && Date.now() - state.openedAt > this.CIRCUIT_TIMEOUT_MS) {
      await this.resetCircuit(providerName);
      return false;
    }
    return true;
  }

  private async recordFailure(providerName: string): Promise<void> {
    const ref = (this.db as any).collection(this.COLLECTION).doc(providerName);
    await (this.db as any).runTransaction(async (tx: any) => {
      const doc = await tx.get(ref);
      const state: CircuitBreakerState = doc.exists
        ? (doc.data() as CircuitBreakerState)
        : { failures: 0, lastFailure: 0, open: false };
      state.failures++;
      state.lastFailure = Date.now();
      if (state.failures >= this.CIRCUIT_THRESHOLD) {
        state.open = true;
        state.openedAt = Date.now();
      }
      tx.set(ref, state);
    });
  }

  private async recordSuccess(providerName: string): Promise<void> {
    await (this.db as any)
      .collection(this.COLLECTION)
      .doc(providerName)
      .set({ failures: 0, lastFailure: 0, open: false, openedAt: null });
  }

  private async resetCircuit(providerName: string): Promise<void> {
    await (this.db as any)
      .collection(this.COLLECTION)
      .doc(providerName)
      .set({ failures: 0, lastFailure: 0, open: false, openedAt: null });
  }

  private executeWithTimeout(
    provider: LLMProvider,
    request: GenerationRequest,
    timeoutMs: number
  ): Promise<GenerationResponse> {
    return new Promise<GenerationResponse>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('PROVIDER_TIMEOUT')), timeoutMs);
      provider
        .generate(request)
        .then((r) => { clearTimeout(timer); resolve(r); })
        .catch((e) => { clearTimeout(timer); reject(e); });
    });
  }
}
