import { jwtDecode } from "jwt-decode";

type DecodeJwt = {
  sub?: string;
  exp?: number;
  [key: string]: unknown;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodeJwt>(token);
    if (!decoded.exp) {
      return false;
    }
    const expiresAtMs = decoded.exp * 1000;
    return expiresAtMs <= Date.now();
  } catch (error) {
    console.warn('디코딩에 실패하였습니다.');
    return true;
  }
}

export function getEmailFromToken(token: string): string | null {
  const decoded = jwtDecode<DecodeJwt>(token);
  return decoded.sub ?? null;
}