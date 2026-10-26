// src/pages/student/ProfilePage.jsx

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Edit,
    Shield,
    Camera,
    Save,
    X,
    BookOpen,
    Award,
    Eye,
    EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import { selectUser, fetchMe } from "@/features/auth/authSlice";
import authService from "@/services/authService";
import enrollmentService from "@/services/enrollmentService";
import certificateService from "@/services/certificateService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
    !d
        ? "N/A"
        : new Date(d).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
          });

const daysSince = (d) => (!d ? 0 : Math.floor((Date.now() - new Date(d)) / 86400000));

const isOAuth = (u) => u?.oauth_provider && u.oauth_provider !== "local";

const calcStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
};

const STRENGTH_META = [
    { label: "VERY WEAK", color: "#EF4444" },
    { label: "WEAK", color: "#F97316" },
    { label: "FAIR", color: "#EAB308" },
    { label: "GOOD", color: "#22C55E" },
    { label: "STRONG", color: "#16A34A" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [certCount, setCertCount] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const [enrRes, certRes] = await Promise.all([
                    enrollmentService.getMyEnrollments(),
                    certificateService.getMyCertificates(),
                ]);
                setEnrolledCount(enrRes.data?.data?.enrollments?.length ?? 0);
                setCertCount(certRes.data?.data?.certificates?.length ?? 0);
            } catch {
                // Stats are optional — keep zero counts on failure
            }
        })();
    }, []);

    return (
        <div
            className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Page heading */}
            <div>
                <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">My Profile</h1>
                <p className="text-[13.5px] text-slate-500 mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* ── Profile Card ── */}
            <div
                className="bg-white rounded-2xl border border-[#EEF2F7] p-6 sm:p-8"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Avatar — square rounded-2xl + initials */}
                    <div
                        className="w-[88px] h-[88px] rounded-2xl shrink-0 flex items-center justify-center text-white text-[32px] font-extrabold overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #3282B8 0%, #0a1628 100%)" }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {/* Name + STUDENT badge */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <h2 className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                                {user?.name}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EBF4FF] text-[#3282B8] border border-[#BFDBFE]">
                                {user?.role ?? "student"}
                            </span>
                        </div>

                        {/* 2-column info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
                            <div className="flex items-center gap-2.5">
                                <Mail size={14} className="text-slate-400 shrink-0" />
                                <span className="text-[13px] text-slate-600">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone size={14} className="text-slate-400 shrink-0" />
                                <span className="text-[13px] text-slate-600">
                                    {user?.mobile || "Not added"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <User size={14} className="text-slate-400 shrink-0" />
                                <span className="text-[13px] text-slate-600 capitalize">
                                    {user?.gender || "Not specified"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                <span className="text-[13px] text-slate-600">
                                    Joined {fmtDate(user?.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons — Edit filled, Change Password outlined */}
                    <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors"
                            style={{ background: "#3282B8" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                        >
                            <Edit size={14} /> Edit Profile
                        </button>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold border-2 border-[#3282B8] text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                        >
                            <Shield size={14} /> Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats — Stitch style ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        tag: "ACTIVE",
                        tagColor: "#3282B8",
                        tagBg: "#EBF4FF",
                        label: "Enrolled Courses",
                        value: enrolledCount,
                        icon: BookOpen,
                        ibg: "#EBF4FF",
                        ic: "#3282B8",
                    },
                    {
                        tag: "EARNED",
                        tagColor: "#F59E0B",
                        tagBg: "#FFFBEB",
                        label: "Certificates Earned",
                        value: certCount,
                        icon: Award,
                        ibg: "#FFFBEB",
                        ic: "#F59E0B",
                    },
                    {
                        tag: "TENURE",
                        tagColor: "#10B981",
                        tagBg: "#F0FDF4",
                        label: "Days as Scholar",
                        value: daysSince(user?.created_at),
                        icon: Calendar,
                        ibg: "#F0FDF4",
                        ic: "#10B981",
                    },
                ].map(({ tag, tagColor, tagBg, label, value, icon: Icon, ibg, ic }) => (
                    <div
                        key={tag}
                        className="bg-white rounded-2xl border border-[#EEF2F7] p-5"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        {/* Icon top-left, tag top-right */}
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: ibg }}
                            >
                                <Icon size={18} style={{ color: ic }} />
                            </div>
                            <span
                                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md"
                                style={{ color: tagColor, background: tagBg }}
                            >
                                {tag}
                            </span>
                        </div>
                        {/* Big number */}
                        <p className="text-[36px] font-extrabold text-slate-900 leading-none mb-1">
                            {String(value).padStart(2, "0")}
                        </p>
                        <p className="text-[12.5px] text-slate-500 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Modals ── */}
            {showEditModal && (
                <EditModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onSaved={() => {
                        setShowEditModal(false);
                        dispatch(fetchMe());
                    }}
                />
            )}
            {showPasswordModal && <PasswordModal user={user} onClose={() => setShowPasswordModal(false)} />}
        </div>
    );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ user, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: user?.name ?? "",
        mobile: user?.mobile ?? "",
        gender: user?.gender ?? "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateProfile(form);
            toast.success("Profile updated successfully! 🎉");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell title="Edit Profile" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar centered */}
                <div className="flex flex-col items-center gap-2.5 pb-2">
                    <div
                        className="w-[76px] h-[76px] rounded-2xl flex items-center justify-center text-white text-[26px] font-extrabold overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #3282B8, #0a1628)" }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Camera size={12} /> Upload Photo
                    </button>
                </div>

                {/* FULL NAME */}
                <FieldGroup label="FULL NAME">
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputCls}
                        placeholder="Your full name"
                    />
                </FieldGroup>

                {/* MOBILE NUMBER */}
                <FieldGroup label="MOBILE NUMBER">
                    <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        className={inputCls}
                        placeholder="+91 XXXXX XXXXX"
                    />
                </FieldGroup>

                {/* GENDER */}
                <FieldGroup label="GENDER">
                    <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className={inputCls}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </FieldGroup>

                <ModalFooter onCancel={onClose} loading={loading} label="Save Changes" />
            </form>
        </ModalShell>
    );
}

// ─── Password Modal ───────────────────────────────────────────────────────────

function PasswordModal({ user, onClose }) {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const strength = calcStrength(passwordForm.newPassword);
    const meta = STRENGTH_META[strength];
    const oauth = isOAuth(user);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (strength < 2) {
            toast.error("Password is too weak");
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success("Password changed successfully! 🎉");
            onClose();
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell
            title="Change Password"
            subtitle="Ensure your account is using a long, random password to stay secure."
            onClose={onClose}
        >
            {/* OAuth warning */}
            {oauth && (
                <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <Shield size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                        Google/GitHub users cannot change password here. Please manage credentials via your
                        identity provider.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* CURRENT PASSWORD */}
                <FieldGroup label="CURRENT PASSWORD">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                            }
                            className={`${inputCls} pr-11`}
                            required
                            disabled={oauth}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </FieldGroup>

                {/* NEW PASSWORD */}
                <FieldGroup label="NEW PASSWORD">
                    <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={inputCls}
                        required
                        disabled={oauth}
                    />
                    {/* 4-segment strength bar */}
                    {passwordForm.newPassword && (
                        <div className="mt-2 space-y-1.5">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                        style={{ background: i <= strength ? meta.color : "#E2E8F0" }}
                                    />
                                ))}
                            </div>
                            <p
                                className="text-[10.5px] font-bold uppercase tracking-widest"
                                style={{ color: meta.color }}
                            >
                                Strength: {meta.label}
                            </p>
                        </div>
                    )}
                </FieldGroup>

                {/* CONFIRM PASSWORD */}
                <FieldGroup label="CONFIRM PASSWORD">
                    <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        className={inputCls}
                        required
                        disabled={oauth}
                    />
                </FieldGroup>

                {/* Info box bottom */}
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-white text-[9px] font-extrabold">
                        i
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                        Google/GitHub users cannot change password through this form. Please manage
                        credentials via your identity provider.
                    </p>
                </div>

                <ModalFooter
                    onCancel={onClose}
                    loading={loading}
                    disabled={oauth || strength < 2}
                    label="Update Password"
                />
            </form>
        </ModalShell>
    );
}

// ─── Shared Components ────────────────────────────────────────────────────────

const inputCls =
    "w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white focus:ring-2 focus:ring-[#3282B8]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

function FieldGroup({ label, children }) {
    return (
        <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function ModalShell({ title, subtitle, onClose, children }) {
    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-2xl">
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
                    <div>
                        <h3 className="text-[17px] font-extrabold text-slate-900">{title}</h3>
                        {subtitle && (
                            <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-0.5 shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 pb-6 pt-5">{children}</div>
            </div>
        </div>
    );
}

function ModalFooter({ onCancel, loading, disabled, label }) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading || disabled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 transition-colors"
                style={{ background: "#3282B8" }}
                onMouseEnter={(e) => {
                    if (!loading && !disabled) e.currentTarget.style.background = "#2a6fa0";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#3282B8";
                }}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={14} />
                        {label}
                    </>
                )}
            </button>
        </div>
    );
}
