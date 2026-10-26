import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMe } from "@/features/auth/authSlice";
import { homeForRole } from "@/config/app";

/**
 * OAuthCallback.jsx
 * Route: /oauth/callback
 *
 * After Google/GitHub sign-in the backend sets auth cookies and redirects here.
 * We load the user via /auth/me and send them to their role's dashboard.
 */
export default function OAuthCallback() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const result = await dispatch(fetchMe()).unwrap();
                navigate(homeForRole(result.user?.role), { replace: true });
            } catch {
                // fetchMe fail — token invalid
                navigate("/login?error=oauth_failed", { replace: true });
            }
        };

        handleCallback();
    }, [dispatch, navigate]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F1F5F9",
            }}
        >
            <div style={{ textAlign: "center" }}>
                {/* Spinner */}
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid #E2E8F0",
                        borderTopColor: "#3282B8",
                        borderRadius: "50%",
                        margin: "0 auto 16px",
                        animation: "spin 0.7s linear infinite",
                    }}
                />
                <p style={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}>Signing you in...</p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
