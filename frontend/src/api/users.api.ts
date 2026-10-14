import { apiClient } from './axios';

export interface BackendUserResponse {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPPORT_AGENT';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetches all registered platform users. (Admin only)
 * Backend endpoint: GET /users
 */
export const getUsersApi = async (): Promise<BackendUserResponse[]> => {
  const response = await apiClient.get<BackendUserResponse[]>('/users');
  return response.data;
};
