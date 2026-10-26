import axios from "axios";
import { API_BASE_URL, AUTH_PATHS, PROTECTED_PREFIXES, ROUTES } from "@/config/app";

/**
 * api.js — the single Axios instance used by every service.
 *
 *  1. Base URL from VITE_API_BASE_URL (must include /api/v1)
 *  2. Attaches the in-memory access token to each request
 *  3. On 401, tries one silent refresh (refresh token lives in an httpOnly cookie)
 *  4. If refresh fails, clears auth state. It only redirects to /login when the
 *     user is on a protected page — public pages keep working for guests.
 */

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let injectedStore = null;
export const injectStore = (store) => {
    injectedStore = store;
};

// Endpoints that must never trigger a refresh attempt
const NO_REFRESH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

const isProtectedPath = (pathname) => PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

// ── Request: attach access token ─────────────────────────
api.interceptors.request.use((config) => {
    const token = injectedStore?.getState().auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response: silent refresh on 401 ──────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
    failedQueue = [];
};

const handleRefreshFailure = async () => {
    if (injectedStore) {
        const { clearAuth } = await import("@/features/auth/authSlice");
        injectedStore.dispatch(clearAuth());
    }

    const { pathname, search } = window.location;
    if (AUTH_PATHS.includes(pathname) || !isProtectedPath(pathname)) return;

    const redirect = encodeURIComponent(pathname + search);
    window.location.assign(`${ROUTES.LOGIN}?redirect=${redirect}`);
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || "";

        const shouldRefresh =
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

        if (!shouldRefresh) return Promise.reject(error);

        if (isRefreshing) {
            return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await api.post("/auth/refresh");
            const newToken = data?.data?.accessToken || data?.accessToken;

            if (injectedStore) {
                const { setToken } = await import("@/features/auth/authSlice");
                injectedStore.dispatch(setToken(newToken));
            }

            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // Guests have no session — a failed refresh during the boot-time
            // session check is expected and must not navigate anywhere.
            if (!url.includes("/auth/me")) await handleRefreshFailure();
            else if (injectedStore) {
                const { clearAuth } = await import("@/features/auth/authSlice");
                injectedStore.dispatch(clearAuth());
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
