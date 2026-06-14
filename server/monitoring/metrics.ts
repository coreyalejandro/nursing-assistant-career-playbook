/**
 * server/monitoring/metrics.ts
 * Prometheus metrics for latency, AI cost/tokens, security events, and MFA posture.
 * Mount `register.metrics()` at GET /metrics behind admin auth.
 */
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export const register = new Registry();

export const METRICS = {
  requestLatency: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.1, 0.5, 1.0, 2.0, 5.0],
    registers: [register],
  }),
  aiCost: new Counter({
    name: 'ai_request_cost_usd_total',
    help: 'Aggregated downstream LLM spend in USD',
    labelNames: ['provider', 'model'] as const,
    registers: [register],
  }),
  aiTokens: new Counter({
    name: 'ai_tokens_total',
    help: 'Total processed prompt/response tokens',
    labelNames: ['provider', 'direction'] as const,
    registers: [register],
  }),
  securityEvents: new Counter({
    name: 'security_events_total',
    help: 'Intercepted prompt-injection vectors or safety anomalies',
    labelNames: ['type', 'severity', 'blocked'] as const,
    registers: [register],
  }),
  mfaEnrollment: new Gauge({
    name: 'mfa_enrollment_rate',
    help: 'Active MFA enrollment rate across tiers',
    labelNames: ['tier'] as const,
    registers: [register],
  }),
};
