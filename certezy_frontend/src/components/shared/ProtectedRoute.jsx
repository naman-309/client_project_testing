import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES, homeForRole } from "@/config/app";

/**
 * Guards private routes only. Public pages (home, courses, about, contact)
 * are never wrapped in this component, so the site always loads without login.
 *
 * - Not signed in        → /login?redirect=<current path>
 * - Wrong role           → the user's own dashboard
 * - Sub-admin 1st login  → /change-password (forced)
 */
export function ProtectedRoute({ children, allowedRoles = [], skipFirstLoginCheck = false }) {
    const location = useLocation();
    const { isLoggedIn, user, isFirstLogin, isInitializing } = useSelector((state) => state.auth);

    // Wait for the initial session check (/auth/me) before deciding
    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!isLoggedIn) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />;
    }

    if (!skipFirstLoginCheck && isFirstLogin && user?.role === "sub_admin") {
        return <Navigate to="/change-password" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to={homeForRole(user?.role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
