import { apiClient } from './axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterAgentCredentials,
  User,
} from '../types';

export const loginApi = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
  );
  return response.data;
};

export const registerAgentApi = async (
  credentials: RegisterAgentCredentials,
): Promise<AuthResponse> => {
  const { name, email, password } = credentials;
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export interface UpdateProfilePayload {
  name: string;
}

export const updateProfileApi = async (
  payload: UpdateProfilePayload,
): Promise<User> => {
  const response = await apiClient.patch<User>('/auth/me', payload);
  return response.data;
};
