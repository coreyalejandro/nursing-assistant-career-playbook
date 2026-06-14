/**
 * server/enterprise/sso.ts
 * SSO scaffold. Callbacks are intentional dead-gates that throw structured
 * errors until a real IdP is configured, so the app deploys safely without
 * pretending SSO is live. provisionUser takes an injected firebase-admin
 * instance (no global reach-arounds) and maps tenant + role claims.
 */
export type EnterpriseRole = 'EMPLOYEE' | 'MANAGER' | 'ORG_ADMIN';

export class SSOIntegration {
  constructor(private admin?: any) {}

  async handleSAMLCallback(_samlResponse: string): Promise<never> {
    throw new Error('SSO_NOT_CONFIGURED');
  }

  async handleOIDCCallback(_code: string): Promise<never> {
    throw new Error('SSO_NOT_CONFIGURED');
  }

  async provisionUser(email: string, tenantId: string, role: EnterpriseRole): Promise<{ uid: string }> {
    if (!this.admin) throw new Error('FIREBASE_ADMIN_NOT_INITIALIZED');
    const user = await this.admin.auth().createUser({ email });
    await this.admin.auth().setCustomUserClaims(user.uid, {
      tenant: { id: tenantId, tier: 'enterprise' },
      role,
    });
    return { uid: user.uid };
  }
}
