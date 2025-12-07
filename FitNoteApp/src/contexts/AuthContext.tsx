import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isAxiosError } from 'axios';
import { Alert, Platform, ToastAndroid } from 'react-native';

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
    const status = error.response?.status;
    const responseData = error.response?.data;
    let message: string | undefined;

    if (status === 401) {
      message = '이메일 또는 비밀번호를 다시 확인해 주세요.';
    } else if (status === 409) {
      message = '이미 사용 중인 정보입니다. 다른 정보로 시도해 주세요.';
    }

    if (!message && responseData && typeof responseData === 'object' && 'message' in responseData) {
      message = String((responseData as { message: unknown }).message);
    } else if (!message && typeof responseData === 'string') {
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

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

function showReLoginNotice(message: string) {
  Alert.alert('로그인이 필요합니다', message, [{ text: '확인' }], {
    cancelable: true,
  });
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
  const sessionExpiredRef = useRef(false);

  const resetAuthState = useCallback(async () => {
    await clearStoredTokens();
    applyAuthToken(null);
    setState({ ...initialState, status: 'unauthenticated' });
  }, []);

  const logout = useCallback(async () => {
    await resetAuthState();
  }, [resetAuthState]);

  const logoutWithSessionNotice = useCallback(
    async (message: string) => {
      if (!sessionExpiredRef.current) {
        showReLoginNotice(message);
      }
      sessionExpiredRef.current = true;
      await resetAuthState();
    },
    [resetAuthState],
  );

  useEffect(() => {
    if (state.status === 'authenticated') {
      sessionExpiredRef.current = false;
    }
  }, [state.status]);

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      throw new Error('이미 토큰을 새로고침 중입니다.');
    }
    const { refreshToken } = state;
    if (!refreshToken) {
      const message = '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.';
      await logoutWithSessionNotice(message);
      throw new Error(message);
    }

    try {
      isRefreshingRef.current = true;
      const refreshed = await refreshAccessTokenRequest(refreshToken);
      await storeTokens(refreshed);
      applyAuthToken(refreshed.accessToken, refreshed.tokenType);
      setState(buildStateFromResponse(refreshed));
      return refreshed.accessToken;
    } catch (error) {
      const message = extractErrorMessage(error) || '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.';
      await logoutWithSessionNotice(message);
      throw new Error(message);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logoutWithSessionNotice, state]);

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
      logoutWithSessionNotice('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.');
    });

    return () => {
      setTokenRefreshCallback(null);
      setLogoutCallback(null);
    };
  }, [logoutWithSessionNotice, refreshAccessToken]);

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
          await resetAuthState();
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
            await logoutWithSessionNotice('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.');
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
  }, [logoutWithSessionNotice, resetAuthState]);

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
        showToast('로그인에 성공했어요!');
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [persistAndSetAuthenticated],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      await registerRequest(payload);
      showToast('회원가입이 완료되었습니다. 로그인해 주세요.');
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