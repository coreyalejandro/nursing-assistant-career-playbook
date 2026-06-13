# Enterprise (HIPAA / BAA) Tier — Architecture Scaffold

This document outlines the path to a hospital / SNF-chain tier where the app is offered as a
workforce-retention benefit. It is a **design**, not yet implemented; `src/lib/tier.ts` carries
the feature flags that gate it.

## Why a separate tier
The consumer (B2C) app intentionally avoids ingesting PHI (it scrubs and refuses it). An
enterprise buyer that wants employee-level analytics or SSO introduces regulated data and
contractual obligations (a signed **Business Associate Agreement**). That belongs in an isolated
environment, not bolted onto the consumer service.

## Data isolation
- **Separate GCP project / Firestore database per enterprise customer** (or a strict per-tenant
  partition with row-level security), so no tenant can read another's data.
- **Customer-Managed Encryption Keys (CMEK)** for data at rest; TLS 1.2+ in transit (already
  enforced via HSTS + Cloud Run).
- **No PHI to the model.** Even in enterprise, the coach stays career-only; any roster/PII used
  for analytics is processed in a separate, access-controlled pipeline — never in prompts.

## Access & identity
- **SSO (SAML/OIDC)** via the employer IdP; map org → tenant claim; drive `tier.ts` from that
  claim instead of the build-time env var.
- **RBAC**: employee, manager, org-admin. Managers see aggregate cohort progress only — never an
  individual's vent-mode/burnout content.

## Auditability & compliance
- **Tamper-evident audit logging** of admin access (who saw what, when), retained per the BAA.
- **Configurable log retention** (default short; redaction already applied via `scrubForLog`).
- **DPA + BAA** with Google Cloud; document the data map and subprocessors.
- **Clinical-boundary review**: red-team the empathy/burnout flow with a licensed advisor to
  guarantee it only supports + refers (988), never diagnoses or treats.

## Suggested build order
1. SSO + tenant claim → `tier.ts` reads org tier.
2. Per-tenant Firestore isolation + CMEK.
3. Manager aggregate dashboard (no individual wellbeing data).
4. Audit logging + retention controls.
5. BAA + security review; then pilot.
