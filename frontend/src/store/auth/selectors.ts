import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import {
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
} from '../../constants/role-permissions';
import type { Permission } from '../../constants/permissions';

export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthInitialized = (state: RootState) =>
  state.auth.isInitialized;

export const selectUserRole = (state: RootState) =>
  state.auth.user?.role ?? null;

export const selectUserPermissions = createSelector(
  [selectUserRole],
  (role) => getRolePermissions(role),
);

export const selectHasPermission =
  (permission: Permission) => (state: RootState) =>
    hasPermission(state.auth.user?.role, permission);

export const selectHasAnyPermission =
  (permissions: readonly Permission[]) => (state: RootState) =>
    hasAnyPermission(state.auth.user?.role, permissions);
