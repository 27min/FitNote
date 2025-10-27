import { apiClient } from "../utils/api";

export type UnitSystem = 'KG' | 'LB';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  unitSystem?: UnitSystem;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  tokenType?: string;
}

export async function register(payload: RegisterPayload) {
  await apiClient.post('/api/auth/register', payload);
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/login', payload);
  return data;
}

export async function refreshAccessToken(refreshToken:string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/refresh', {
    refreshToken,
  } satisfies RefreshPayload);
  return data;
}