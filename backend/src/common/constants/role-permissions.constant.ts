import { UserRole, Permission } from '../enums';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.MANAGE_TICKETS,
    Permission.VIEW_ASSIGNED_TICKETS,
    Permission.UPDATE_TICKET_STATUS,
  ],
  [UserRole.SUPPORT_AGENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ASSIGNED_TICKETS,
    Permission.UPDATE_TICKET_STATUS,
  ],
};
