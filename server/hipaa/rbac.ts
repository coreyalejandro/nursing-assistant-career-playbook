/**
 * server/hipaa/rbac.ts
 * Role-based access control for the enterprise tier. Managers see cohort
 * aggregates only — never an individual's wellbeing/vent data.
 */
import { Request, Response, NextFunction } from 'express';

export const ROLES = {
  EMPLOYEE: { canSeeOwnData: true, canSeeCohortData: false, canSeeIndividualData: false, canExport: false },
  MANAGER: { canSeeOwnData: true, canSeeCohortData: true, canSeeIndividualData: false, canExport: true },
  ORG_ADMIN: { canSeeOwnData: true, canSeeCohortData: true, canSeeIndividualData: true, canExport: true },
} as const;

export type Role = keyof typeof ROLES;
export type Permission = 'canSeeOwnData' | 'canSeeCohortData' | 'canSeeIndividualData' | 'canExport';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: Role;
    tenantId: string;
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user || !user.role) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }
    const rolePermissions = ROLES[user.role];
    if (!rolePermissions || !rolePermissions[permission]) {
      res.status(403).json({ error: 'INSUFFICIENT_RBAC_PRIVILEGES', required: permission });
      return;
    }
    next();
  };
}
