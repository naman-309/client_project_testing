/**
 * Application-wide configuration.
 * Values come from Vite env vars (see .env.example) with safe defaults.
 */

const trimSlash = (value) => (value || "").replace(/\/$/, "");

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Certezy";
export const APP_URL = trimSlash(import.meta.env.VITE_APP_URL || window.location.origin);
export const API_BASE_URL = trimSlash(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1");
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@certezy.com";

// Brand wordmark is rendered as "Cert" + accented "ezy"
export const BRAND = {
    prefix: "Cert",
    accent: "ezy",
};

// Route constants — single place to change paths
export const ROUTES = {
    HOME: "/",
    COURSES: "/courses",
    ABOUT: "/about",
    CONTACT: "/contact-us",
    LOGIN: "/login",
    REGISTER: "/register",
    OAUTH_CALLBACK: "/oauth/callback",
    CHECKOUT: "/checkout",
    STUDENT_DASHBOARD: "/student/dashboard",
    STUDENT_PROFILE: "/student/profile",
    ADMIN_DASHBOARD: "/admin/dashboard",
};

export const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.OAUTH_CALLBACK];
export const PROTECTED_PREFIXES = ["/student", "/admin", ROUTES.CHECKOUT];

export const ADMIN_ROLES = ["admin", "sub_admin"];

/** Default landing page for a signed-in user, by role. */
export const homeForRole = (role) =>
    ADMIN_ROLES.includes(role) ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD;

/** Only allow in-app relative redirects (prevents open-redirect via ?redirect=). */
export const safeRedirect = (value) => {
    if (!value) return null;
    const decoded = decodeURIComponent(value);
    return decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : null;
};
