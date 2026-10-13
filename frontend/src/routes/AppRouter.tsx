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
  DashboardPage,
  UnauthorizedPage,
  NotFoundPage,
} from "../pages";

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
      {/* Public marketing pages wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      </Route>

      {/* Public-only authentication routes: redirects authenticated users to /dashboard */}
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Protected routes wrapped with dashboard layout (AppLayout + Sidebar + Header) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayoutWrapper />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        </Route>
      </Route>

      {/* Error & utility routes */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* Catch-all 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
