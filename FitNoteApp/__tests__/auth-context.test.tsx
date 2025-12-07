import React, { useEffect } from 'react';
import { Alert, ToastAndroid } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { AuthProvider } from '../src/contexts/AuthContext';
import { useAuth } from '../src/hooks/useAuth';
import {
  login as loginRequest,
  refreshAccessToken as refreshAccessTokenRequest,
  register as registerRequest,
  TokenResponse,
} from '../src/services/authApi';
import {
  clearStoredTokens,
  loadStoredTokens,
  storeTokens,
} from '../src/storage/authStorage';
import { applyAuthToken, setLogoutCallback, setTokenRefreshCallback } from '../src/utils/api';
import { getEmailFromToken, isTokenExpired } from '../src/utils/jwt';

jest.mock('../src/services/authApi');
jest.mock('../src/storage/authStorage');
jest.mock('../src/utils/api');
jest.mock('../src/utils/jwt');

function AuthConsumer({ onChange }: { onChange: (value: ReturnType<typeof useAuth>) => void }) {
  const value = useAuth();
  useEffect(() => {
    onChange(value);
  }, [onChange, value]);
  return null;
}

const tokenResponse: TokenResponse = {
  accessToken: 'access-token',
  accessTokenExpiresInSeconds: 3600,
  refreshToken: 'refresh-token',
  refreshTokenExpiresInSeconds: 3600,
  tokenType: 'Bearer',
};

const mockedLogin = loginRequest as jest.MockedFunction<typeof loginRequest>;
const mockedRefresh = refreshAccessTokenRequest as jest.MockedFunction<typeof refreshAccessTokenRequest>;
const mockedRegister = registerRequest as jest.MockedFunction<typeof registerRequest>;
const mockedLoadStoredTokens = loadStoredTokens as jest.MockedFunction<typeof loadStoredTokens>;
const mockedStoreTokens = storeTokens as jest.MockedFunction<typeof storeTokens>;
const mockedClearStoredTokens = clearStoredTokens as jest.MockedFunction<typeof clearStoredTokens>;
const mockedApplyAuthToken = applyAuthToken as jest.MockedFunction<typeof applyAuthToken>;
const mockedSetTokenRefreshCallback = setTokenRefreshCallback as jest.MockedFunction<typeof setTokenRefreshCallback>;
const mockedSetLogoutCallback = setLogoutCallback as jest.MockedFunction<typeof setLogoutCallback>;
const mockedGetEmailFromToken = getEmailFromToken as jest.MockedFunction<typeof getEmailFromToken>;
const mockedIsTokenExpired = isTokenExpired as jest.MockedFunction<typeof isTokenExpired>;

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

beforeEach(() => {
  mockedLoadStoredTokens.mockResolvedValue(null);
  mockedStoreTokens.mockResolvedValue();
  mockedClearStoredTokens.mockResolvedValue();
  mockedApplyAuthToken.mockImplementation(() => {});
  mockedSetTokenRefreshCallback.mockImplementation(() => {});
  mockedSetLogoutCallback.mockImplementation(() => {});
  mockedGetEmailFromToken.mockReturnValue('tester@example.com');
  mockedIsTokenExpired.mockReturnValue(false);
  mockedLogin.mockReset();
  mockedRegister.mockReset();
  mockedRefresh.mockReset();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

async function renderAuth(onChange: (value: ReturnType<typeof useAuth>) => void) {
  await act(async () => {
    ReactTestRenderer.create(
      <AuthProvider>
        <AuthConsumer onChange={onChange} />
      </AuthProvider>,
    );
  });
}

describe('AuthContext', () => {
  it('logs in successfully and updates auth state', async () => {
    mockedLogin.mockResolvedValue(tokenResponse);
    const onChange = jest.fn();
    let latestAuth: ReturnType<typeof useAuth> | undefined;
    onChange.mockImplementation((value) => {
      latestAuth = value;
    });

    await renderAuth(onChange);
    await flushPromises();

    expect(latestAuth?.status).toBe('unauthenticated');

    await act(async () => {
      await latestAuth?.login({ email: 'user@example.com', password: 'password123' });
    });
    await flushPromises();

    expect(mockedStoreTokens).toHaveBeenCalledWith(tokenResponse);
    expect(mockedApplyAuthToken).toHaveBeenCalledWith(
      tokenResponse.accessToken,
      tokenResponse.tokenType,
    );
    expect(latestAuth?.status).toBe('authenticated');
    expect(latestAuth?.email).toBe('tester@example.com');
  });

  it('keeps user unauthenticated when login fails', async () => {
    mockedLogin.mockRejectedValue(new Error('인증 실패'));
    const onChange = jest.fn();
    let latestAuth: ReturnType<typeof useAuth> | undefined;
    onChange.mockImplementation((value) => {
      latestAuth = value;
    });

    await renderAuth(onChange);
    await flushPromises();

    await expect(
      latestAuth?.login({ email: 'wrong@example.com', password: 'password123' }),
    ).rejects.toThrow('인증 실패');

    await flushPromises();
    expect(latestAuth?.status).toBe('unauthenticated');
    expect(mockedStoreTokens).not.toHaveBeenCalled();
    expect(mockedApplyAuthToken).toHaveBeenCalledTimes(1);
    expect(mockedApplyAuthToken).toHaveBeenLastCalledWith(null);
  });
});
