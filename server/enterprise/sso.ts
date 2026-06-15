/**
 * server/enterprise/sso.ts
 * SSO scaffold. Callbacks are intentional dead-gates that throw structured
 * errors until a real IdP is configured, so the app deploys safely without
 * pretending SSO is live. provisionUser takes an injected Supabase admin
 * client (no global reach-arounds) and maps tenant + role into app_metadata
 * claims — the same claims the RLS helpers in 0002_enterprise.sql read.
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
    if (!this.admin) throw new Error('SUPABASE_ADMIN_NOT_INITIALIZED');
    // Supabase admin API: create the user, then attach tenant + role as
    // app_metadata claims so the RLS policies (enterprise.tenant_id() /
    // enterprise.role()) can authorize them.
    const { data, error } = await this.admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { tenant_id: tenantId, tier: 'enterprise', role: role.toLowerCase() },
    });
    if (error) throw new Error(error.message);
    return { uid: data.user.id };
  }
}
