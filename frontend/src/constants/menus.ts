import { PERMISSIONS, type Permission } from './permissions';
import { ROUTES } from './routes';
import { hasPermission } from './role-permissions';
import type { UserRole } from './roles';

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  iconName: string;
  requiredPermission?: Permission;
}

export const MAIN_MENU_ITEMS: readonly MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    iconName: 'DashboardOutlined',
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    key: 'tickets',
    label: 'Tickets',
    path: ROUTES.TICKETS,
    iconName: 'CustomerServiceOutlined',
    requiredPermission: PERMISSIONS.VIEW_ASSIGNED_TICKETS,
  },
  {
    key: 'deleted-tickets',
    label: 'Deleted Tickets',
    path: ROUTES.DELETED_TICKETS,
    iconName: 'DeleteOutlined',
    requiredPermission: PERMISSIONS.MANAGE_TICKETS,
  },
  {
    key: 'users',
    label: 'Users',
    path: ROUTES.USERS,
    iconName: 'TeamOutlined',
    requiredPermission: PERMISSIONS.MANAGE_USERS,
  },
  {
    key: 'profile',
    label: 'Profile',
    path: ROUTES.PROFILE,
    iconName: 'UserOutlined',
  },
] as const;

/**
 * Filters navigation items based on the user's role-based permissions.
 */
export const getAccessibleMenuItems = (role?: UserRole | null): MenuItem[] => {
  return MAIN_MENU_ITEMS.filter((item) => {
    if (!item.requiredPermission) {
      return true;
    }
    return hasPermission(role, item.requiredPermission);
  });
};
