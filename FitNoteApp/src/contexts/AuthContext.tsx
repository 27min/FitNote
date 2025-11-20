import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isAxiosError } from 'axios';

import { 
  login as loginRequest,
  refreshAccessToken as refreshAccessTokenRequest,
  register as registerRequest,
} from "../services/authApi";
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from "../services/authApi";
import {
  clearStoredTokens,
  loadStoredTokens,
  storeTokens,
} from "../storage/authStorage";
import { applyAuthToken, setTokenRefreshCallback, setLogoutCallback } from '../utils/api';
import { getEmailFromToken, isTokenExpired } from '../utils/jwt';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  email: string | null;
}

type AuthContextValue = {
  status: AuthStatus;
  accessToken: string | null;
  email: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}

const initialState: AuthState = {
  status: 'loading',
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  email: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    let message: string | undefined;
    if (responseData && typeof responseData === 'object' && 'message' in responseData) {
      message = String((responseData as { message: unknown }).message);
    } else if (typeof responseData === 'string') {
      message = responseData;
    }

    if (!message) {
      message = error.message;
    }
    return message ?? '서버 요청 처리 중 오류가 발생했습니다.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

function resolveEmailFromToken(accessToken: string | null): string | null {
  if (!accessToken) {
    return null;
  }
  try {
    return getEmailFromToken(accessToken);
  } catch (error) {
    console.warn('Failed to decode access token', error);
    return null;
  }
}

function buildStateFromResponse(response: TokenResponse): AuthState {
  const email = resolveEmailFromToken(response.accessToken);
  return {
    status: 'authenticated',
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    tokenType: response.tokenType ?? 'Bearer',
    email,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const isRefreshingRef = useRef(false);

  const logout = useCallback(async () => {
    await clearStoredTokens();
    applyAuthToken(null);
    setState({ ...initialState, status: 'unauthenticated' });
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      throw new Error('이미 토큰을 새로고침 중입니다.');
    }
    const { refreshToken } = state;
    if (!refreshToken) {
      await logout();
      throw new Error('새로고침 토큰이 없습니다. 다시 로그인해 주세요.');
    }

    try {
      isRefreshingRef.current = true;
      const refreshed = await refreshAccessTokenRequest(refreshToken);
      await storeTokens(refreshed);
      applyAuthToken(refreshed.accessToken, refreshed.tokenType);
      setState(buildStateFromResponse(refreshed));
      return refreshed.accessToken;
    } catch (error) {
      await logout();
      throw new Error(extractErrorMessage(error));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout, state]);

  // API 인터셉터에 콜백 설정
  useEffect(() => {
    setTokenRefreshCallback(async () => {
      try {
        await refreshAccessToken();
        return true;
      } catch (error) {
        console.warn('Token refresh failed in interceptor:', error);
        return false;
      }
    });

    setLogoutCallback(() => {
      logout();
    });

    return () => {
      setTokenRefreshCallback(null);
      setLogoutCallback(null);
    };
  }, [refreshAccessToken, logout]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedTokens = await loadStoredTokens();
        if (!savedTokens) {
          setState((prev) => ({ ...prev, status: 'unauthenticated' }));
          applyAuthToken(null);
          return;
        }

        const { accessToken, refreshToken, tokenType } = savedTokens;

        if (!accessToken || !refreshToken) {
          await clearStoredTokens();
          setState((prev) => ({ ...prev, status: 'unauthenticated' }));
          applyAuthToken(null);
          return;
        }

        if (isTokenExpired(accessToken)) {
          try {
            const refreshed = await refreshAccessTokenRequest(refreshToken);
            await storeTokens(refreshed);
            applyAuthToken(refreshed.accessToken, refreshed.tokenType);
            setState(buildStateFromResponse(refreshed));
          } catch (error) {
            console.warn('Failed to refresh token on bootstrap', error);
            await clearStoredTokens();
            applyAuthToken(null);
            setState((prev) => ({ ...prev, status: 'unauthenticated' }));
          }
          return;
        }

        applyAuthToken(accessToken, tokenType);
        const email = resolveEmailFromToken(accessToken);
        setState({
          status: 'authenticated',
          accessToken,
          refreshToken,
          tokenType: tokenType ?? 'Bearer',
          email,
        });
      } catch (error) {
        console.warn('Failed to bootstrap auth state', error);
        setState((prev) => ({ ...prev, status: 'unauthenticated' }));
      }
    };

    bootstrap();
  }, []);

  const persistAndSetAuthenticated = useCallback(async (response: TokenResponse) => {
    await storeTokens(response);
    applyAuthToken(response.accessToken, response.tokenType);
    setState(buildStateFromResponse(response));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const response = await loginRequest(payload);
        await persistAndSetAuthenticated(response);
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [persistAndSetAuthenticated],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      await registerRequest(payload);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      accessToken: state.accessToken,
      email: state.email,
      login,
      register,
      logout,
      refreshAccessToken,
    }),
    [state, login, register, logout, refreshAccessToken],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}