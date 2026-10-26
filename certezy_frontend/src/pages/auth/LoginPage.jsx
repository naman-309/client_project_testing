import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
    loginUser,
    selectAuthLoading,
    selectIsLoggedIn,
    selectUser,
    clearError,
} from "@/features/auth/authSlice";
import SocialButtons from "@/components/auth/SocialButtons";
import { homeForRole, safeRedirect } from "@/config/app";
import BrandName from "@/components/shared/BrandName";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const loading = useSelector(selectAuthLoading);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (isLoggedIn) {
            navigate(safeRedirect(params.get("redirect")) || homeForRole(user?.role), { replace: true });
        }
    }, [isLoggedIn, user, navigate, params]);

    useEffect(() => {
        return () => dispatch(clearError());
    }, []);

    // OAuth error from URL param
    useEffect(() => {
        if (params.get("error") === "oauth_failed") {
            toast.error("OAuth login failed. Please try again.");
        }
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
        if (!form.password) errs.password = "Password is required";
        else if (form.password.length < 6) errs.password = "Minimum 6 characters";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const result = await dispatch(loginUser(form)).unwrap();
            toast.success(`Welcome back, ${result.user?.name?.split(" ")[0]}!`);
            navigate(safeRedirect(params.get("redirect")) || homeForRole(result.user?.role), {
                replace: true,
            });
        } catch (err) {
            toast.error(err || "Login failed. Please try again.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F1F5F9",
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "960px",
                    display: "flex",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(15,23,42,0.14)",
                    minHeight: "560px",
                }}
            >
                {/* ── LEFT PANEL ── */}
                <div
                    className="hidden md:flex"
                    style={{
                        flex: "0 0 420px",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "48px 44px",
                        background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.045,
                            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                            pointerEvents: "none",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "-60px",
                            right: "-60px",
                            width: "280px",
                            height: "280px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(50,130,184,0.15) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <Logo size="lg" style={{ marginBottom: "48px" }} />

                        <h2
                            style={{
                                fontSize: "clamp(24px, 3vw, 30px)",
                                fontWeight: 800,
                                color: "#fff",
                                lineHeight: 1.2,
                                letterSpacing: "-0.02em",
                                marginBottom: "14px",
                            }}
                        >
                            Welcome back to your learning journey.
                        </h2>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65 }}>
                            Continue from where you left off. Your certifications are waiting.
                        </p>
                    </div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                            <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                                {[
                                    { value: "500+", label: "Courses" },
                                    { value: "50k+", label: "Students" },
                                    { value: "4.8★", label: "Rating" },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                fontWeight: 800,
                                                color: "#fff",
                                                lineHeight: 1,
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            {s.value}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "11.5px",
                                                color: "rgba(255,255,255,0.40)",
                                                marginTop: "3px",
                                            }}
                                        >
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div
                    style={{
                        flex: 1,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 44px",
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "380px" }}>
                        <div className="flex md:hidden items-center gap-2 mb-8">
                            <Logo size="sm" />
                        </div>

                        <h1
                            style={{
                                fontSize: "26px",
                                fontWeight: 800,
                                color: "#0F172A",
                                letterSpacing: "-0.02em",
                                marginBottom: "6px",
                            }}
                        >
                            Welcome back
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "28px" }}>
                            Sign in to continue learning
                        </p>

                        <SocialButtons />

                        <Divider />

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Email */}
                            <div style={{ marginBottom: "16px" }}>
                                <Label text="Email Address" />
                                <InputWrapper
                                    icon={<Mail size={15} style={iconSt} />}
                                    error={fieldErrors.email}
                                >
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        style={inputSt(!!fieldErrors.email)}
                                        onFocus={(e) => onFocus(e, !!fieldErrors.email)}
                                        onBlur={(e) => onBlur(e, !!fieldErrors.email)}
                                    />
                                </InputWrapper>
                                <FieldErr msg={fieldErrors.email} />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: "22px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <Label text="Password" noMargin />
                                    <Link
                                        to="/forgot-password"
                                        style={{
                                            fontSize: "12.5px",
                                            fontWeight: 600,
                                            color: "#3282B8",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <InputWrapper
                                    icon={<Lock size={15} style={iconSt} />}
                                    error={fieldErrors.password}
                                >
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        style={{ ...inputSt(!!fieldErrors.password), paddingRight: "44px" }}
                                        onFocus={(e) => onFocus(e, !!fieldErrors.password)}
                                        onBlur={(e) => onBlur(e, !!fieldErrors.password)}
                                    />
                                    <EyeBtn show={showPassword} toggle={() => setShowPass(!showPassword)} />
                                </InputWrapper>
                                <FieldErr msg={fieldErrors.password} />
                            </div>

                            <SubmitBtn loading={loading} label="Sign In" loadingLabel="Signing in..." />
                        </form>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "13.5px",
                                color: "#64748B",
                                marginTop: "20px",
                            }}
                        >
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                style={{ fontWeight: 700, color: "#3282B8", textDecoration: "none" }}
                            >
                                Sign up free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
        </div>
    );
}

// ── Shared small components ────────────────────────────────

function Logo({ size = "lg" }) {
    const big = size === "lg";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: big ? "10px" : "8px" }}>
            <div
                style={{
                    width: big ? "32px" : "28px",
                    height: big ? "32px" : "28px",
                    borderRadius: big ? "9px" : "8px",
                    background: "#3282B8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: big ? "0 2px 8px rgba(50,130,184,0.4)" : "none",
                }}
            >
                <svg
                    width={big ? 16 : 14}
                    height={big ? 16 : 14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            </div>
            <span
                style={{
                    fontSize: big ? "17px" : "16px",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.5px",
                }}
            >
                <BrandName accentColor="#3282B8" />
            </span>
        </div>
    );
}

function Divider() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>
                OR CONTINUE WITH EMAIL
            </span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
        </div>
    );
}

function Label({ text, noMargin }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: noMargin ? 0 : "6px",
            }}
        >
            {text}
        </label>
    );
}

function InputWrapper({ icon, children }) {
    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                }}
            >
                {icon}
            </div>
            {children}
        </div>
    );
}

function EyeBtn({ show, toggle }) {
    return (
        <button
            type="button"
            onClick={toggle}
            style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
                padding: 0,
            }}
        >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
    );
}

function FieldErr({ msg }) {
    if (!msg) return null;
    return <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "5px" }}>{msg}</p>;
}

function SubmitBtn({ loading, label, loadingLabel }) {
    return (
        <button
            type="submit"
            disabled={loading}
            style={{
                width: "100%",
                height: "46px",
                borderRadius: "10px",
                border: "none",
                background: loading ? "#94A3B8" : "#3282B8",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: loading ? "none" : "0 2px 8px rgba(50,130,184,0.30)",
            }}
            onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#2a6fa0";
            }}
            onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#3282B8";
            }}
        >
            {loading ? (
                <>
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 0.7s linear infinite",
                        }}
                    />
                    {loadingLabel}
                </>
            ) : (
                label
            )}
        </button>
    );
}

// ── Style helpers — fixed (no stale closure bug) ───────────
const iconSt = {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94A3B8",
};

const inputSt = (hasError) => ({
    width: "100%",
    height: "46px",
    paddingLeft: "42px",
    paddingRight: "14px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    color: "#0F172A",
    border: hasError ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
    background: hasError ? "#FEF2F2" : "#F8FAFC",
    transition: "all 0.15s",
    boxSizing: "border-box",
});

// FIX — live check at event time, not closure time
const onFocus = (e, hasError) => {
    if (!hasError) {
        e.target.style.borderColor = "#3282B8";
        e.target.style.background = "#fff";
        e.target.style.boxShadow = "0 0 0 3px rgba(50,130,184,0.10)";
    }
};

const onBlur = (e, hasError) => {
    if (!hasError) {
        e.target.style.borderColor = "#E2E8F0";
        e.target.style.background = "#F8FAFC";
        e.target.style.boxShadow = "none";
    }
};
