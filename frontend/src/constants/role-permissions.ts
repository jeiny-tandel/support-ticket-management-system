import { USER_ROLES, type UserRole } from './roles';
import { PERMISSIONS, type Permission } from './permissions';

/**
 * Mapping of user roles to granted permissions.
 * Source of truth: Backend role capabilities.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_TICKETS,
    PERMISSIONS.VIEW_ASSIGNED_TICKETS,
    PERMISSIONS.UPDATE_TICKET_STATUS,
  ],
  [USER_ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ASSIGNED_TICKETS,
    PERMISSIONS.UPDATE_TICKET_STATUS,
  ],
} as const;

/**
 * Returns permissions granted to a given role.
 */
export const getRolePermissions = (role?: UserRole | null): readonly Permission[] => {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return [];
  }
  return ROLE_PERMISSIONS[role];
};

/**
 * Verifies if a user role has a specific permission.
 */
export const hasPermission = (
  role: UserRole | null | undefined,
  permission: Permission,
): boolean => {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
};

/**
 * Verifies if a user role has any of the requested permissions.
 */
export const hasAnyPermission = (
  role: UserRole | null | undefined,
  permissions: readonly Permission[],
): boolean => {
  const rolePermissions = getRolePermissions(role);
  return permissions.some((permission) => rolePermissions.includes(permission));
};
