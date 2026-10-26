import api from "./api";
import { API_BASE_URL } from "@/config/app";

/**
 * authService.js
 *
 * Base URL (VITE_API_BASE_URL) already includes /api/v1,
 * so paths here start at /auth/...
 */

const authService = {
    // Local auth
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    refresh: () => api.post("/auth/refresh"),
    logout: () => api.post("/auth/logout"),
    changePassword: (data) => api.post("/auth/change-password", data),
    updateProfile: (data) => api.put("/auth/profile", data),
    me: () => api.get("/auth/me"),

    // OAuth — browser redirect
    googleLogin: () => window.location.assign(`${API_BASE_URL}/auth/google`),
    githubLogin: () => window.location.assign(`${API_BASE_URL}/auth/github`),

    // Admin
    getAllUsers: () => api.get("/auth/users/all"),
    getUserById: (id) => api.get(`/auth/users/${id}`),
    updateUserStatus: (id, data) => api.put(`/auth/users/${id}/status`, data),
};

export default authService;
