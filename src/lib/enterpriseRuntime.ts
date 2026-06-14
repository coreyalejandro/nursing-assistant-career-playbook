/**
 * src/lib/enterpriseRuntime.ts
 * Client-side helpers for reading tenant tier + enforcing tenant boundaries
 * from a signed-in user's custom claims.
 */
export interface CustomClaims {
  tenant?: {
    id: string;
    tier: 'free' | 'pro' | 'enterprise';
  };
  role?: 'EMPLOYEE' | 'MANAGER' | 'ORG_ADMIN';
}

export interface RuntimeUser {
  uid: string;
  email: string;
  customClaims?: CustomClaims;
}

export function getTier(user: RuntimeUser | null): 'free' | 'pro' | 'enterprise' {
  if (!user || !user.customClaims || !user.customClaims.tenant) return 'free';
  return user.customClaims.tenant.tier || 'free';
}

export function isEnterprise(user: RuntimeUser | null): boolean {
  return getTier(user) === 'enterprise';
}

export function assertTenantBoundary(user: RuntimeUser | null, expectedTenantId: string): boolean {
  if (!user || !user.customClaims || !user.customClaims.tenant) return false;
  return user.customClaims.tenant.id === expectedTenantId;
}
