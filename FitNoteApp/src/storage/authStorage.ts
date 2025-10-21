import EncryptedStorage from "react-native-encrypted-storage";

import type { TokenResponse } from "../services/authApi";

const AUTH_STORAGE_KEY = 'FITNOTE_AUTH_TOKENS';

export type StoredTokens = Pick<TokenResponse, 'accessToken' | 'refreshToken' | 'tokenType'>;

export async function storeTokens(tokens: TokenResponse) {
  const payload: StoredTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenType: tokens.tokenType ?? 'Bearer',
  };
  await EncryptedStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export async function loadStoredTokens(): Promise<StoredTokens | null> {
  const raw = await EncryptedStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredTokens;
  } catch (error) {
    console.warn('Failed to parse stored auth tokens', error);
    await EncryptedStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function clearStoredTokens() {
  await EncryptedStorage.removeItem(AUTH_STORAGE_KEY);
}