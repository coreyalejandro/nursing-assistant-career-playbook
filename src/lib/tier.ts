/**
 * src/lib/tier.ts
 * ---------------------------------------------------------------------------
 * Product-tier feature flags SCAFFOLD.
 *
 * Separates the free B2C consumer experience from a future HIPAA/BAA-covered
 * enterprise tier (hospitals / SNF chains offering upskilling as a retention
 * benefit). See ENTERPRISE.md for the data-isolation architecture this implies.
 *
 * Drive the tier from an env var at build/deploy time (VITE_APP_TIER) or, later,
 * from the signed-in user's org claim. Defaults to the free consumer tier so
 * nothing changes for current users.
 * ---------------------------------------------------------------------------
 */

export type Tier = "free" | "pro" | "enterprise";

export interface TierFeatures {
  tier: Tier;
  /** Live AI coach, job search, salary grounding. */
  aiCoach: boolean;
  /** Mock interview practice + resume ATS tailoring. */
  premiumCareerTools: boolean;
  /** Push/job-match notifications + progress dashboard persistence. */
  retentionSuite: boolean;
  /** Org dashboards, SSO, audit logging, customer-managed encryption keys. */
  enterpriseControls: boolean;
  /** Whether a signed Business Associate Agreement (BAA) context is active. */
  baaCovered: boolean;
}

const MATRIX: Record<Tier, TierFeatures> = {
  free: { tier: "free", aiCoach: true, premiumCareerTools: false, retentionSuite: false, enterpriseControls: false, baaCovered: false },
  pro: { tier: "pro", aiCoach: true, premiumCareerTools: true, retentionSuite: true, enterpriseControls: false, baaCovered: false },
  enterprise: { tier: "enterprise", aiCoach: true, premiumCareerTools: true, retentionSuite: true, enterpriseControls: true, baaCovered: true },
};

function resolveTier(): Tier {
  // Vite exposes import.meta.env.* at build time. Fall back to "free".
  const raw = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_APP_TIER) || "free";
  return raw === "pro" || raw === "enterprise" ? raw : "free";
}

export const FEATURES: TierFeatures = MATRIX[resolveTier()];

export function hasFeature(key: keyof Omit<TierFeatures, "tier" | "baaCovered">): boolean {
  return Boolean(FEATURES[key]);
}
