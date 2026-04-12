import api from './api';
import * as SecureStore from 'expo-secure-store';

// ---------- Types ----------

export interface User {
  id: string;
  phone: string;
  fullName: string;
  state: string;
  district: string;
  preferredLanguage: string;
  primaryProblemType: string;
  onboardingCompleted: boolean;
  email?: string;
  profile: {
    age?: number;
    gender?: string;
    occupation?: string;
    incomeCategory?: string;
    hasExistingLawyer?: boolean;
    urgencyLevel?: string;
    opposingPartyType?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

// ---------- Service ----------

export async function register(data: {
  phone: string;
  password: string;
  fullName: string;
}): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  const result = response.data;
  await SecureStore.setItemAsync('accessToken', result.accessToken);
  await SecureStore.setItemAsync('refreshToken', result.refreshToken);
  return result;
}

export async function login(data: {
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  const result = response.data;
  await SecureStore.setItemAsync('accessToken', result.accessToken);
  await SecureStore.setItemAsync('refreshToken', result.refreshToken);
  return result;
}

export async function refreshToken(token: string): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>('/auth/refresh', {
    refreshToken: token,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout API errors — we clear locally regardless
  }
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

// Convenience: bundled as an object for backward compatibility
export const authService = {
  register,
  login,
  refreshToken,
  logout,
  async getStoredTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return { accessToken, refreshToken };
  },
};
