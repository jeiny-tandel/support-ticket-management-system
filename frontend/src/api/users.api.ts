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

export interface PaginatedUsersResponse {
  items: BackendUserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersParams {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
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

export const getUsersApi = async (
  params?: GetUsersParams,
): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<PaginatedUsersResponse>('/users', {
    params,
  });
  return response.data;
};

export const createUserApi = async (
  payload: CreateUserPayload,
): Promise<BackendUserResponse> => {
  const response = await apiClient.post<BackendUserResponse>('/users', payload);
  return response.data;
};

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

export const deleteUserApi = async (
  id: string,
): Promise<BackendUserResponse> => {
  const response = await apiClient.delete<BackendUserResponse>(`/users/${id}`);
  return response.data;
};

