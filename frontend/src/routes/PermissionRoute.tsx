import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectUserRole } from "../store";
import { hasPermission, hasAnyPermission } from "../constants/role-permissions";
import type { Permission } from "../constants/permissions";
import { ROUTES } from "../constants/routes";

export interface PermissionRouteProps {
  /** Single required permission */
  permission?: Permission;
  /** List of permissions where any one satisfies access */
  anyOfPermissions?: readonly Permission[];
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permission,
  anyOfPermissions,
}) => {
  const userRole = useAppSelector(selectUserRole);

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (anyOfPermissions && anyOfPermissions.length > 0) {
    hasAccess = hasAnyPermission(userRole, anyOfPermissions);
  }

  if (!hasAccess) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
