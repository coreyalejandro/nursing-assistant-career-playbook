import { getTier, isEnterprise, assertTenantBoundary, RuntimeUser } from './enterpriseRuntime';

const enterpriseUser: RuntimeUser = {
  uid: 'u1', email: 'a@org.com',
  customClaims: { tenant: { id: 'tenant-acme', tier: 'enterprise' }, role: 'MANAGER' },
};
const freeUser: RuntimeUser = { uid: 'u2', email: 'b@example.com' };

describe('enterpriseRuntime', () => {
  it('returns free for null/anonymous users', () => {
    expect(getTier(null)).toBe('free');
    expect(getTier(freeUser)).toBe('free');
    expect(isEnterprise(null)).toBe(false);
  });

  it('reads enterprise tier from claims', () => {
    expect(getTier(enterpriseUser)).toBe('enterprise');
    expect(isEnterprise(enterpriseUser)).toBe(true);
  });

  it('enforces tenant boundary', () => {
    expect(assertTenantBoundary(enterpriseUser, 'tenant-acme')).toBe(true);
    expect(assertTenantBoundary(enterpriseUser, 'tenant-other')).toBe(false);
    expect(assertTenantBoundary(freeUser, 'tenant-acme')).toBe(false);
    expect(assertTenantBoundary(null, 'tenant-acme')).toBe(false);
  });

  it('defaults tier to free when tenant present but tier missing', () => {
    const u = { uid: 'u3', email: 'c@org.com', customClaims: { tenant: { id: 't', tier: undefined as any } } };
    expect(getTier(u)).toBe('free');
  });
});
