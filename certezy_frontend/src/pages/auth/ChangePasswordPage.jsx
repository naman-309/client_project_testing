import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

import authService from "@/services/authService";
import { clearAuth, selectIsFirstLogin } from "@/features/auth/authSlice";
import { ROUTES } from "@/config/app";

// Mirrors the backend Joi rule in middleware/validate.js
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

const FIELDS = [
    { name: "currentPassword", label: "Current password" },
    { name: "newPassword", label: "New password" },
    { name: "confirmPassword", label: "Confirm new password" },
];

/**
 * Route: /change-password
 * Used for the forced first-login password change (sub-admins) and reachable
 * by any signed-in user. The backend revokes all sessions on success, so the
 * user is sent back to /login.
 */
export default function ChangePasswordPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isFirstLogin = useSelector(selectIsFirstLogin);

    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!PASSWORD_RULE.test(form.newPassword)) {
            toast.error("Use 8+ characters with upper & lower case, a number and a symbol");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            await authService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success("Password changed. Please sign in again.");
            dispatch(clearAuth());
            navigate(ROUTES.LOGIN, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-5">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[420px] bg-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
            >
                <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                    <Lock size={20} className="text-primary" />
                </div>
                <h1 className="text-[22px] font-extrabold text-slate-900 mb-1">Change your password</h1>
                <p className="text-[13.5px] text-text-secondary mb-6">
                    {isFirstLogin
                        ? "For security, please set a new password before continuing."
                        : "Choose a strong password you don't use elsewhere."}
                </p>

                {FIELDS.map(({ name, label }) => (
                    <label key={name} className="block mb-4">
                        <span className="block text-[13px] font-semibold text-slate-700 mb-1.5">{label}</span>
                        <input
                            type="password"
                            name={name}
                            value={form[name]}
                            onChange={handleChange}
                            required
                            autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                ))}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 mt-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[14px] transition-colors disabled:opacity-60"
                >
                    {submitting ? "Updating…" : "Update password"}
                </button>
            </form>
        </div>
    );
}
