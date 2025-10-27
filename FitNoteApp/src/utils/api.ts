import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = Platform.select({
    ios : 'http://localhost:8080',
    android : 'http://10.0.2.2:8080',
    default : 'http://localhost:8080',
});

let currentAccessToken: string | null = null;
let currentTokenType: string | null = null;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    if (currentAccessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `${currentTokenType ?? 'Bearer'} ${currentAccessToken}`;
    }
    return config;
});

export function applyAuthToken(accessToken: string | null, tokenType? : string | null) {
    currentAccessToken = accessToken;
    currentTokenType = tokenType ?? (accessToken ? 'Bearer' : null);
    if (accessToken) {
        apiClient.defaults.headers.common.Authorization = `${currentTokenType ?? 'Bearer'} ${accessToken}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
}

export function getBaseUrl() {
    return BASE_URL;
}