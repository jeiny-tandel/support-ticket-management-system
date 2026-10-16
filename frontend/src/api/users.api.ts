import { apiClient } from './axios';
import type { UserRole } from '../constants/roles';

export interface BackendUserResponse {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUsersParams {
  role?: UserRole;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
}

/**
 * Fetches registered platform users with optional role filtering. (Admin only)
 * Backend endpoint: GET /users
 */
export const getUsersApi = async (
  params?: GetUsersParams,
): Promise<BackendUserResponse[]> => {
  const response = await apiClient.get<BackendUserResponse[]>('/users', {
    params,
  });
  return response.data;
};

/**
 * Creates a new user. (Admin only)
 * Backend endpoint: POST /users
 */
export const createUserApi = async (
  payload: CreateUserPayload,
): Promise<BackendUserResponse> => {
  const response = await apiClient.post<BackendUserResponse>('/users', payload);
  return response.data;
};

/**
 * Updates a user's name and/or role. (Admin only)
 * Backend endpoint: PATCH /users/:id
 */
export const updateUserApi = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<BackendUserResponse> => {
  const response = await apiClient.patch<BackendUserResponse>(
    `/users/${id}`,
    payload,
  );
  return response.data;
};

/**
 * Deletes a user account. (Admin only)
 * Backend endpoint: DELETE /users/:id
 */
export const deleteUserApi = async (
  id: string,
): Promise<BackendUserResponse> => {
  const response = await apiClient.delete<BackendUserResponse>(`/users/${id}`);
  return response.data;
};

