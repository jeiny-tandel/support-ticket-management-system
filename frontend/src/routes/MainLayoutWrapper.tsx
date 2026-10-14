import React, { useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppLayout, type SidebarItem } from "../components/layout";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout, selectCurrentUser, selectUserRole } from "../store";
import { getAccessibleMenuItems } from "../constants/menus";
import { ROUTES } from "../constants/routes";

import { socketService } from "../services";

export const MainLayoutWrapper: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);

  const accessibleMenuItems = useMemo(
    () => getAccessibleMenuItems(userRole),
    [userRole],
  );

  const activeKey = useMemo(() => {
    const matched = accessibleMenuItems.find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== ROUTES.DASHBOARD &&
          location.pathname.startsWith(item.path)),
    );
    return matched?.key ?? "dashboard";
  }, [accessibleMenuItems, location.pathname]);

  const handleSelectMenuKey = (_key: string, item: SidebarItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <AppLayout
      sidebarItems={accessibleMenuItems}
      selectedMenuKey={activeKey}
      onSelectMenuKey={handleSelectMenuKey}
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : null
      }
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
};

export default MainLayoutWrapper;
