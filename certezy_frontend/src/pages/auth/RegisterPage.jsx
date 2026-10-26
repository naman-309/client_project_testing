import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { selectAuthLoading, selectIsLoggedIn, selectUser, clearError } from "@/features/auth/authSlice";
import authService from "@/services/authService";
import SocialButtons from "@/components/auth/SocialButtons";
import { homeForRole } from "@/config/app";
import BrandName from "@/components/shared/BrandName";

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loading = useSelector(selectAuthLoading);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);

    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isLoggedIn) navigate(homeForRole(user?.role), { replace: true });
    }, [isLoggedIn, user, navigate]);

    useEffect(() => {
        return () => dispatch(clearError());
    }, []);

    // Password strength
    const getStrength = (p) => {
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    };

    const strengthInfo = [
        { label: "", color: "#E2E8F0" },
        { label: "Weak", color: "#EF4444" },
        { label: "Fair", color: "#F59E0B" },
        { label: "Good", color: "#3B82F6" },
        { label: "Strong", color: "#10B981" },
    ];

    const strength = getStrength(form.password);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Full name is required";
        else if (form.name.trim().length < 2) errs.name = "Name too short";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
        if (!form.password) {
            errs.password = "Password is required";
        } else if (form.password.length < 8) {
            errs.password = "Minimum 8 characters required";
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`])/.test(form.password)
        ) {
            errs.password = "Must contain uppercase, lowercase, number & special character";
        }
        if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
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
            setSubmitting(true);

            // Step 1 — Register
            await authService.register({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            // Step 2 — Redirect strictly to Login page
            toast.success("Account created successfully! Please sign in.");
            navigate("/login", { replace: true });
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            const errorMsg =
                Array.isArray(apiErrors) && apiErrors.length > 0
                    ? apiErrors.join(". ")
                    : err.response?.data?.message || err.message || "Registration failed. Please try again.";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const isLoading = loading || submitting;

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
                    maxWidth: "980px",
                    display: "flex",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(15,23,42,0.14)",
                    minHeight: "600px",
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
                            bottom: "-60px",
                            left: "-60px",
                            width: "280px",
                            height: "280px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(50,130,184,0.12) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <Logo size="lg" style={{ marginBottom: "48px" }} />

                        <h2
                            style={{
                                fontSize: "clamp(22px, 2.8vw, 28px)",
                                fontWeight: 800,
                                color: "#fff",
                                lineHeight: 1.2,
                                letterSpacing: "-0.02em",
                                marginBottom: "14px",
                            }}
                        >
                            Start your certification journey today.
                        </h2>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "rgba(255,255,255,0.50)",
                                lineHeight: 1.65,
                                marginBottom: "36px",
                            }}
                        >
                            Join thousands of professionals advancing their careers with industry-recognized
                            certifications.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {[
                                {
                                    icon: "🎓",
                                    title: "500+ Certification Courses",
                                    desc: "AWS, Azure, Security+, PMP and more",
                                },
                                {
                                    icon: "📜",
                                    title: "Industry Certificates",
                                    desc: "Recognized by top employers globally",
                                },
                                {
                                    icon: "⚡",
                                    title: "Learn at Your Pace",
                                    desc: "Lifetime access to course materials",
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: "rgba(50,130,184,0.18)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            fontSize: "16px",
                                        }}
                                    >
                                        {f.icon}
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "13.5px",
                                                fontWeight: 700,
                                                color: "#fff",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {f.title}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)" }}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <p
                            style={{
                                fontSize: "11.5px",
                                color: "rgba(255,255,255,0.28)",
                                letterSpacing: "0.05em",
                            }}
                        >
                            © {new Date().getFullYear()} Certezy • Secure Registration
                        </p>
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
                        overflowY: "auto",
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "380px" }}>
                        <div className="flex md:hidden items-center gap-2 mb-8">
                            <Logo size="sm" dark />
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
                            Create your account
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "28px" }}>
                            Free forever. No credit card required.
                        </p>

                        <SocialButtons />

                        <Divider />

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Full Name */}
                            <div style={{ marginBottom: "16px" }}>
                                <Label text="Full Name" />
                                <div style={{ position: "relative" }}>
                                    <User size={15} style={iconSt} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Rahul Kumar"
                                        autoComplete="name"
                                        style={inputSt(!!fieldErrors.name)}
                                        onFocus={(e) => onFocus(e, !!fieldErrors.name)}
                                        onBlur={(e) => onBlur(e, !!fieldErrors.name)}
                                    />
                                </div>
                                <FieldErr msg={fieldErrors.name} />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: "16px" }}>
                                <Label text="Email Address" />
                                <div style={{ position: "relative" }}>
                                    <Mail size={15} style={iconSt} />
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
                                </div>
                                <FieldErr msg={fieldErrors.email} />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: "16px" }}>
                                <Label text="Password" />
                                <div style={{ position: "relative" }}>
                                    <Lock size={15} style={iconSt} />
                                    <input
                                        type={showPass ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        style={{ ...inputSt(!!fieldErrors.password), paddingRight: "44px" }}
                                        onFocus={(e) => onFocus(e, !!fieldErrors.password)}
                                        onBlur={(e) => onBlur(e, !!fieldErrors.password)}
                                    />
                                    <EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />
                                </div>

                                {/* Strength bar */}
                                {form.password && (
                                    <div style={{ marginTop: "8px" }}>
                                        <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        height: "3px",
                                                        borderRadius: "2px",
                                                        background:
                                                            i <= strength
                                                                ? strengthInfo[strength].color
                                                                : "#E2E8F0",
                                                        transition: "background 0.2s",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: "11.5px",
                                                color: strengthInfo[strength].color,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {strengthInfo[strength].label}
                                        </p>
                                    </div>
                                )}
                                <FieldErr msg={fieldErrors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: "24px" }}>
                                <Label text="Confirm Password" />
                                <div style={{ position: "relative" }}>
                                    <Lock size={15} style={iconSt} />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        style={{
                                            ...inputSt(!!fieldErrors.confirmPassword),
                                            paddingRight: "44px",
                                        }}
                                        onFocus={(e) => onFocus(e, !!fieldErrors.confirmPassword)}
                                        onBlur={(e) => onBlur(e, !!fieldErrors.confirmPassword)}
                                    />
                                    <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />

                                    {/* Live match checkmark */}
                                    {form.confirmPassword && form.password === form.confirmPassword && (
                                        <CheckCircle
                                            size={15}
                                            style={{
                                                position: "absolute",
                                                right: "40px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "#10B981",
                                            }}
                                        />
                                    )}
                                </div>
                                <FieldErr msg={fieldErrors.confirmPassword} />
                            </div>

                            <SubmitBtn
                                loading={isLoading}
                                label="Create Account →"
                                loadingLabel="Creating account..."
                            />
                        </form>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "13.5px",
                                color: "#64748B",
                                marginTop: "20px",
                            }}
                        >
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                style={{ fontWeight: 700, color: "#3282B8", textDecoration: "none" }}
                            >
                                Sign in
                            </Link>
                        </p>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "11.5px",
                                color: "#94A3B8",
                                marginTop: "14px",
                                lineHeight: 1.5,
                            }}
                        >
                            By creating an account, you agree to our{" "}
                            <Link to="/terms" style={{ color: "#3282B8", textDecoration: "none" }}>
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" style={{ color: "#3282B8", textDecoration: "none" }}>
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
        </div>
    );
}

// ── Shared components ──────────────────────────────────────

function Logo({ size = "lg", dark = false }) {
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
                    color: dark ? "#0F172A" : "#fff",
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

function Label({ text }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
            }}
        >
            {text}
        </label>
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

// ── Style helpers — FIX: live check at event time ──────────
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
