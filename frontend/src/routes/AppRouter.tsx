import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCurrentUser,
  setInitialized,
  selectIsAuthInitialized,
} from "../store";
import { AUTH_TOKEN_KEY } from "../constants/auth";
import { ROUTES } from "../constants/routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { MainLayoutWrapper } from "./MainLayoutWrapper";
import { PublicLayout } from "../components/layout";
import {
  HomePage,
  AboutPage,
  LoginPage,
  RegisterPage,
} from "../pages/public";
import { DashboardPage } from "../pages/dashboard";
import {
  UnauthorizedPage,
  NotFoundPage,
  ProfilePage,
} from "../pages/shared";
import {
  TicketsPage,
  TicketDetailsPage,
  DeletedTicketsPage,
} from "../pages/tickets";
import { AgentsPage } from "../pages/admin";
import { PERMISSIONS } from "../constants/permissions";
import { PermissionRoute } from "./PermissionRoute";

export const AppRouter: React.FC = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spin size="large" />
          <span className="text-sm text-gray-500 font-medium">
            Initializing SolviX...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayoutWrapper />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TICKETS} element={<TicketsPage />} />
          <Route path={ROUTES.TICKET_DETAILS} element={<TicketDetailsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          <Route
            element={<PermissionRoute permission={PERMISSIONS.MANAGE_TICKETS} />}
          >
            <Route path={ROUTES.DELETED_TICKETS} element={<DeletedTicketsPage />} />
          </Route>

          <Route
            element={<PermissionRoute permission={PERMISSIONS.MANAGE_USERS} />}
          >
            <Route path={ROUTES.USERS} element={<AgentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
