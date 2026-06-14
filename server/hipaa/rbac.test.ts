import { requirePermission, ROLES, AuthenticatedRequest } from './rbac';
import type { Response } from 'express';

function mockRes() {
  const res: Partial<Response> & { statusCode?: number; body?: any } = {};
  res.status = ((code: number) => { (res as any).statusCode = code; return res as Response; }) as any;
  res.json = ((body: any) => { (res as any).body = body; return res as Response; }) as any;
  return res as Response & { statusCode?: number; body?: any };
}

describe('requirePermission', () => {
  it('401s when unauthenticated', () => {
    const req = {} as AuthenticatedRequest;
    const res = mockRes();
    const next = jest.fn();
    requirePermission('canSeeOwnData')(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('403s a MANAGER trying to see individual data', () => {
    const req = { user: { uid: 'u1', role: 'MANAGER', tenantId: 't1' } } as AuthenticatedRequest;
    const res = mockRes();
    const next = jest.fn();
    requirePermission('canSeeIndividualData')(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.required).toBe('canSeeIndividualData');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a MANAGER to see cohort data', () => {
    const req = { user: { uid: 'u1', role: 'MANAGER', tenantId: 't1' } } as AuthenticatedRequest;
    const res = mockRes();
    const next = jest.fn();
    requirePermission('canSeeCohortData')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows ORG_ADMIN to see individual data and export', () => {
    const req = { user: { uid: 'a1', role: 'ORG_ADMIN', tenantId: 't1' } } as AuthenticatedRequest;
    const next = jest.fn();
    requirePermission('canSeeIndividualData')(req, mockRes(), next);
    requirePermission('canExport')(req, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('matrix: EMPLOYEE cannot see cohort or export', () => {
    expect(ROLES.EMPLOYEE.canSeeCohortData).toBe(false);
    expect(ROLES.EMPLOYEE.canExport).toBe(false);
  });
});
