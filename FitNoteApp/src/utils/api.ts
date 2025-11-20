import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

const BASE_URL = Platform.select({
    ios : 'http://localhost:8080',
    android : 'http://10.0.2.2:8080',
    default : 'http://localhost:8080',
});

let currentAccessToken: string | null = null;
let currentTokenType: string | null = null;

// 토큰 갱신 콜백 (순환 참조 방지를 위해 외부에서 설정)
let onTokenRefreshCallback: (() => Promise<boolean>) | null = null;
let onLogoutCallback: (() => void) | null = null;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: 요청에 Authorization 헤더 추가
apiClient.interceptors.request.use((config) => {
    if (currentAccessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `${currentTokenType ?? 'Bearer'} ${currentAccessToken}`;
    }
    return config;
});

// Response Interceptor: 에러 처리 및 토큰 갱신
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 네트워크 에러 처리
        if (!error.response) {
            return Promise.reject(new Error('네트워크 연결을 확인해 주세요.'));
        }

        // 401 에러 처리 (인증 실패)
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 토큰 갱신 중이면 큐에 추가
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 갱신 시도
                if (onTokenRefreshCallback) {
                    const refreshed = await onTokenRefreshCallback();
                    if (refreshed) {
                        processQueue(null);
                        return apiClient(originalRequest);
                    }
                }
                // 토큰 갱신 실패 시 로그아웃
                if (onLogoutCallback) {
                    onLogoutCallback();
                }
                processQueue(new Error('인증이 만료되었습니다. 다시 로그인해 주세요.'));
                return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해 주세요.'));
            } catch (refreshError) {
                processQueue(refreshError as Error);
                if (onLogoutCallback) {
                    onLogoutCallback();
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 403 에러 처리 (권한 없음)
        if (error.response.status === 403) {
            return Promise.reject(new Error('접근 권한이 없습니다.'));
        }

        // 404 에러 처리
        if (error.response.status === 404) {
            return Promise.reject(new Error('요청한 리소스를 찾을 수 없습니다.'));
        }

        // 500번대 서버 에러
        if (error.response.status >= 500) {
            return Promise.reject(new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'));
        }

        // 그 외 에러는 서버에서 온 메시지 사용
        const errorMessage = (error.response.data as { message?: string })?.message || error.message;
        return Promise.reject(new Error(errorMessage));
    }
);

export function applyAuthToken(accessToken: string | null, tokenType? : string | null) {
    currentAccessToken = accessToken;
    currentTokenType = tokenType ?? (accessToken ? 'Bearer' : null);
    if (accessToken) {
        apiClient.defaults.headers.common.Authorization = `${currentTokenType ?? 'Bearer'} ${accessToken}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
}

/**
 * 토큰 갱신 콜백 설정
 * AuthContext에서 호출하여 토큰 갱신 로직을 주입합니다.
 * @param callback 토큰 갱신 성공 시 true, 실패 시 false를 반환하는 함수
 */
export function setTokenRefreshCallback(callback: (() => Promise<boolean>) | null) {
    onTokenRefreshCallback = callback;
}

/**
 * 로그아웃 콜백 설정
 * AuthContext에서 호출하여 로그아웃 로직을 주입합니다.
 */
export function setLogoutCallback(callback: (() => void) | null) {
    onLogoutCallback = callback;
}

export function getBaseUrl() {
    return BASE_URL;
}