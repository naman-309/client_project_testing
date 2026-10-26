import { useState, useEffect, useCallback } from "react";
import {
    Users,
    Search,
    Download,
    Plus,
    UserX,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    X,
    Save,
    Loader2,
    Eye,
    EyeOff,
    BookOpen,
    Users2,
    CreditCard,
    ClipboardList,
    Tag,
    Shield,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import authService from "@/services/authService";
import { cn } from "@/lib/utils";
import adminService from "@/services/adminService";

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

const PER_PAGE = 10;

const PERMISSIONS = [
    {
        key: "can_manage_courses",
        label: "Course Management",
        desc: "Can create, edit and archive courses",
        icon: BookOpen,
        color: "#3282B8",
        bg: "#EBF4FF",
    },
    {
        key: "can_manage_students",
        label: "Student Admission",
        desc: "Can approve and enroll new students",
        icon: Users2,
        color: "#8B5CF6",
        bg: "#F5F3FF",
    },
    {
        key: "can_send_discounts",
        label: "Financial Records",
        desc: "Can view transaction logs and billing",
        icon: CreditCard,
        color: "#F59E0B",
        bg: "#FFFBEB",
    },
    {
        key: "can_view_payments",
        label: "Payment Access",
        desc: "Can view payment reports and history",
        icon: Tag,
        color: "#10B981",
        bg: "#F0FDF4",
    },
    {
        key: "can_manage_tests",
        label: "Certification Issuance",
        desc: "Authorized to manage tests and quizzes",
        icon: ClipboardList,
        color: "#EF4444",
        bg: "#FEF2F2",
    },
];

const EMPTY_SUB_ADMIN = {
    name: "",
    email: "",
    password: "",
    can_manage_courses: 0,
    can_manage_students: 0,
    can_send_discounts: 0,
    can_view_payments: 0,
    can_manage_tests: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
    !d
        ? "—"
        : new Date(d).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          });

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const [tab, setTab] = useState("students"); // "students" | "subadmins"

    // Students state
    const [students, setStudents] = useState([]);
    const [stuLoading, setStuLoading] = useState(true);
    const [stuSearch, setStuSearch] = useState("");
    const [stuStatus, setStuStatus] = useState("");
    const [stuPage, setStuPage] = useState(1);
    const [, setStuTotal] = useState(0);

    // Sub-admins state
    const [subAdmins, setSubAdmins] = useState([]);
    const [saLoading, setSaLoading] = useState(true);

    // Modals
    const [blockTarget, setBlockTarget] = useState(null); // { user, action }
    const [blockLoading, setBlockLoading] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null); // sub-admin object
    const [showRevoke, setShowRevoke] = useState(null); // sub-admin object

    const [addForm, setAddForm] = useState(EMPTY_SUB_ADMIN);
    const [editPerms, setEditPerms] = useState({});
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Load students ──────────────────────────────────────────────────────────
    const loadStudents = useCallback(async () => {
        setStuLoading(true);
        try {
            const params = {
                role: "student",
                page: stuPage,
                limit: PER_PAGE,
                ...(stuSearch && { search: stuSearch }),
            };
            const { data } = await authService.getAllUsers(params);
            const list = data?.data ?? [];

            // Filter by role since backend not filtering properly
            const studentsOnly = Array.isArray(list) ? list.filter((user) => user.role === "student") : [];

            setStudents(studentsOnly);
            setStuTotal(studentsOnly.length); // Use filtered count instead of pagination
        } catch (err) {
            toast.error("Failed to load students");
        } finally {
            setStuLoading(false);
        }
    }, [stuPage, stuSearch]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);
    useEffect(() => {
        setStuPage(1);
    }, [stuSearch, stuStatus]);

    // ── Load sub-admins ────────────────────────────────────────────────────────
    const loadSubAdmins = useCallback(async () => {
        setSaLoading(true);
        try {
            const { data } = await authService.getAllUsers({ role: "sub_admin", limit: 100 });
            const list = data?.data ?? [];

            // Filter by role since backend not filtering properly
            const subAdminsOnly = Array.isArray(list) ? list.filter((user) => user.role === "sub_admin") : [];

            // No permissions loop — permissions: {} by default
            setSubAdmins(subAdminsOnly.map((sa) => ({ ...sa, permissions: {} })));
        } catch {
            toast.error("Failed to load sub-admins");
        } finally {
            setSaLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSubAdmins();
    }, [loadSubAdmins]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const activeStudents = students.filter((u) => u.is_active === 1).length;
    const blockedStudents = students.filter((u) => u.is_active !== 1).length;

    // ── Filter students ────────────────────────────────────────────────────────
    const filteredStudents = students.filter((u) => {
        const q = stuSearch.toLowerCase();
        const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const matchStatus = !stuStatus || (stuStatus === "active" ? u.is_active === 1 : u.is_active !== 1);
        return matchSearch && matchStatus;
    });
    const totalPages = Math.ceil(filteredStudents.length / PER_PAGE);
    const paginated = filteredStudents.slice((stuPage - 1) * PER_PAGE, stuPage * PER_PAGE);

    // ── Block / Unblock ────────────────────────────────────────────────────────
    const handleBlockConfirm = async () => {
        if (!blockTarget) return;
        setBlockLoading(true);
        try {
            const newActive = blockTarget.action === "block" ? 0 : 1;
            await authService.updateUserStatus(blockTarget.user.id, { is_active: newActive });
            toast.success(`User ${blockTarget.action === "block" ? "blocked" : "unblocked"}!`);
            setBlockTarget(null);
            loadStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setBlockLoading(false);
        }
    };

    // ── Create sub-admin ───────────────────────────────────────────────────────
    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
            toast.error("Name, email and password are required");
            return;
        }
        setSaving(true);
        try {
            await adminService.createSubAdmin(addForm);
            toast.success("Sub-admin created!");
            setShowAddModal(false);
            setAddForm(EMPTY_SUB_ADMIN);
            loadSubAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create sub-admin");
        } finally {
            setSaving(false);
        }
    };

    // ── Edit permissions ───────────────────────────────────────────────────────
    const openEditPerms = async (sa) => {
        // Fetch permissions on-demand
        try {
            const pr = await adminService.getPermissions(sa.id);
            const perms = pr.data?.data?.permissions ?? {};
            setEditPerms({
                can_manage_courses: perms.can_manage_courses ?? 0,
                can_manage_students: perms.can_manage_students ?? 0,
                can_send_discounts: perms.can_send_discounts ?? 0,
                can_view_payments: perms.can_view_payments ?? 0,
                can_manage_tests: perms.can_manage_tests ?? 0,
            });
        } catch {
            // Fallback to empty permissions
            setEditPerms({
                can_manage_courses: 0,
                can_manage_students: 0,
                can_send_discounts: 0,
                can_view_payments: 0,
                can_manage_tests: 0,
            });
        }
        setShowEditModal(sa);
    };

    const handleSavePerms = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.updatePermissions(showEditModal.id, editPerms);
            toast.success("Permissions updated!");
            setShowEditModal(null);
            loadSubAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    // ── Revoke sub-admin ───────────────────────────────────────────────────────
    const handleRevoke = async () => {
        if (!showRevoke) return;
        setSaving(true);
        try {
            await adminService.deletePermissions(showRevoke.id);
            toast.success(`${showRevoke.name}'s access revoked!`);
            setShowRevoke(null);
            // Remove locally instead of reloading
            setSubAdmins((prev) => prev.filter((sa) => sa.id !== showRevoke.id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to revoke");
        } finally {
            setSaving(false);
        }
    };

    const setAF = (k, v) => setAddForm((p) => ({ ...p, [k]: v }));

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Dashboard › <span style={{ color: "#3282B8" }}>Users</span>
                    </p>
                    <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
                        User Management
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Manage students and sub-admin access
                    </p>
                </div>
                {tab === "subadmins" && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0 transition-colors"
                        style={{ background: "#3282B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                    >
                        <Plus size={15} /> Add Sub-Admin
                    </button>
                )}
                {tab === "students" && (
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0">
                        <Download size={15} /> Export
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Users",
                        value: students.length + subAdmins.length,
                        icon: Users,
                        ibg: "#EBF4FF",
                        ic: "#3282B8",
                    },
                    {
                        label: "Active Students",
                        value: activeStudents,
                        icon: CheckCircle2,
                        ibg: "#F0FDF4",
                        ic: "#16A34A",
                    },
                    {
                        label: "Blocked Users",
                        value: blockedStudents,
                        icon: UserX,
                        ibg: "#FEF2F2",
                        ic: "#EF4444",
                    },
                    {
                        label: "Sub-Admins",
                        value: subAdmins.length,
                        icon: Shield,
                        ibg: "#F5F3FF",
                        ic: "#8B5CF6",
                    },
                ].map(({ label, value, icon: Icon, ibg, ic }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-slate-100 p-4"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: ibg }}
                            >
                                <Icon size={18} style={{ color: ic }} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="text-[22px] font-extrabold text-slate-900 leading-none mt-0.5">
                                    {value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {[
                    { key: "students", label: "Students List" },
                    { key: "subadmins", label: "Sub-Admins" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[13px] font-bold transition-all duration-150",
                            tab === key ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                        style={tab === key ? { background: "#3282B8" } : {}}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: Students ── */}
            {tab === "students" && (
                <>
                    {/* Search + filter */}
                    <div
                        className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3"
                        style={{ boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}
                    >
                        <div className="relative flex-1">
                            <Search
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={stuSearch}
                                onChange={(e) => setStuSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-slate-50 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                            />
                        </div>
                        <select
                            value={stuStatus}
                            onChange={(e) => setStuStatus(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white outline-none focus:border-[#3282B8] cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        {/* Head */}
                        <div
                            className="grid px-5 py-3 bg-slate-50 border-b border-slate-100"
                            style={{ gridTemplateColumns: "1fr 120px 130px 110px 120px" }}
                        >
                            {["User", "Mobile", "Joined", "Status", "Action"].map((h) => (
                                <span
                                    key={h}
                                    className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider"
                                >
                                    {h}
                                </span>
                            ))}
                        </div>

                        {stuLoading ? (
                            <TableSkeleton cols={5} rows={6} />
                        ) : paginated.length === 0 ? (
                            <EmptyRow message="No students found" />
                        ) : (
                            paginated.map((user) => {
                                const isActive = user.is_active === 1;
                                return (
                                    <div
                                        key={user.id}
                                        className="grid px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/60 transition-colors items-center"
                                        style={{ gridTemplateColumns: "1fr 120px 130px 110px 120px" }}
                                    >
                                        {/* User */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-extrabold shrink-0"
                                                style={{
                                                    background: "linear-gradient(135deg, #3282B8, #0a1628)",
                                                }}
                                            >
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-slate-900 truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-[11.5px] text-slate-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Mobile */}
                                        <p className="text-[12.5px] text-slate-600">{user.mobile || "—"}</p>
                                        {/* Joined */}
                                        <p className="text-[12.5px] text-slate-600">
                                            {fmtDate(user.created_at)}
                                        </p>
                                        {/* Status */}
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                    isActive ? "bg-green-500" : "bg-red-400"
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    "text-[12px] font-semibold",
                                                    isActive ? "text-green-700" : "text-red-600"
                                                )}
                                            >
                                                {isActive ? "Active" : "Blocked"}
                                            </span>
                                        </div>
                                        {/* Action */}
                                        <div>
                                            {isActive ? (
                                                <button
                                                    onClick={() => setBlockTarget({ user, action: "block" })}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                                >
                                                    <UserX size={13} /> Block
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setBlockTarget({ user, action: "unblock" })
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-[12px] font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                                                >
                                                    <UserCheck size={13} /> Unblock
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Pagination */}
                        {!stuLoading && totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                                <p className="text-[12.5px] text-slate-500">
                                    {filteredStudents.length} students
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setStuPage((p) => Math.max(1, p - 1))}
                                        disabled={stuPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                                        (p) => (
                                            <button
                                                key={p}
                                                onClick={() => setStuPage(p)}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                                                    stuPage === p
                                                        ? "text-white"
                                                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                )}
                                                style={stuPage === p ? { background: "#3282B8" } : {}}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={() => setStuPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={stuPage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── TAB 2: Sub-Admins ── */}
            {tab === "subadmins" &&
                (saLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin" style={{ color: "#3282B8" }} />
                    </div>
                ) : subAdmins.length === 0 ? (
                    <div
                        className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center gap-4 text-center"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
                            <Shield size={26} style={{ color: "#8B5CF6" }} />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-slate-800">No sub-admins yet</p>
                            <p className="text-[13px] text-slate-400 mt-1">Grant team members admin access</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
                            style={{ background: "#3282B8" }}
                        >
                            <Plus size={15} /> Add Sub-Admin
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {subAdmins.map((sa) => (
                            <SubAdminCard
                                key={sa.id}
                                subAdmin={sa}
                                onEdit={() => openEditPerms(sa)}
                                onRevoke={() => setShowRevoke(sa)}
                            />
                        ))}
                    </div>
                ))}

            {/* ── Block / Unblock Modal ── */}
            {blockTarget && (
                <Overlay onClose={() => setBlockTarget(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-7 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <UserX size={28} className="text-red-500" />
                        </div>
                        <h3 className="text-[17px] font-extrabold text-slate-900 mb-2">
                            {blockTarget.action === "block" ? "Block" : "Unblock"} {blockTarget.user.name}?
                        </h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-6 max-w-[260px] mx-auto">
                            {blockTarget.action === "block"
                                ? "The user will lose access to all courses and their subscription will be paused. You can unblock them at any time."
                                : "The user will regain access to all their enrolled courses."}
                        </p>
                        <div className="space-y-2.5">
                            <button
                                onClick={handleBlockConfirm}
                                disabled={blockLoading}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-bold text-white transition-colors disabled:opacity-60",
                                    blockTarget.action === "block"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-green-600 hover:bg-green-700"
                                )}
                            >
                                {blockLoading ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : blockTarget.action === "block" ? (
                                    "Confirm Block"
                                ) : (
                                    "Confirm Unblock"
                                )}
                            </button>
                            <button
                                onClick={() => setBlockTarget(null)}
                                className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* ── Add Sub-Admin Modal ── */}
            {showAddModal && (
                <Overlay onClose={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-[17px] font-extrabold text-slate-900">
                                    Add New Sub-Admin
                                </h3>
                                <p className="text-[12.5px] text-slate-400 mt-0.5">
                                    Grant system access to a new team member.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors mt-0.5"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubAdmin} className="overflow-y-auto flex-1">
                            <div className="px-6 py-5 space-y-5">
                                {/* Basic info */}
                                <div>
                                    <SectionLabel icon={Users} label="Basic Information" />
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <Field label="Full Name">
                                            <input
                                                type="text"
                                                required
                                                value={addForm.name}
                                                onChange={(e) => setAF("name", e.target.value)}
                                                className={inputCls}
                                                placeholder="John Doe"
                                            />
                                        </Field>
                                        <Field label="Email Address">
                                            <input
                                                type="email"
                                                required
                                                value={addForm.email}
                                                onChange={(e) => setAF("email", e.target.value)}
                                                className={inputCls}
                                                placeholder="john@certezy.edu"
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-4">
                                        <Field label="Temporary Password">
                                            <div className="relative">
                                                <input
                                                    type={showPw ? "text" : "password"}
                                                    required
                                                    value={addForm.password}
                                                    onChange={(e) => setAF("password", e.target.value)}
                                                    className={cn(inputCls, "pr-11")}
                                                    placeholder="••••••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPw((p) => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </Field>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div>
                                    <SectionLabel icon={Shield} label="Access Permissions" />
                                    <div className="mt-3 space-y-2.5">
                                        {PERMISSIONS.map((p) => (
                                            <PermissionRow
                                                key={p.key}
                                                perm={p}
                                                checked={!!addForm[p.key]}
                                                onChange={(v) => setAF(p.key, v ? 1 : 0)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubAdmin}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                style={{ background: "#3282B8" }}
                                onMouseEnter={(e) => {
                                    if (!saving) e.currentTarget.style.background = "#2a6fa0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#3282B8";
                                }}
                            >
                                {saving ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={14} /> Create Sub-Admin
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* ── Edit Permissions Modal ── */}
            {showEditModal && (
                <Overlay onClose={() => setShowEditModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-slate-900">
                                    Edit Permissions
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">{showEditModal.name}</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePerms} className="px-6 py-5 space-y-2.5">
                            {PERMISSIONS.map((p) => (
                                <PermissionRow
                                    key={p.key}
                                    perm={p}
                                    checked={!!editPerms[p.key]}
                                    onChange={(v) =>
                                        setEditPerms((prev) => ({ ...prev, [p.key]: v ? 1 : 0 }))
                                    }
                                />
                            ))}
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                    style={{ background: "#3282B8" }}
                                    onMouseEnter={(e) => {
                                        if (!saving) e.currentTarget.style.background = "#2a6fa0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3282B8";
                                    }}
                                >
                                    {saving ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={14} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Overlay>
            )}

            {/* ── Revoke Modal ── */}
            {showRevoke && (
                <Overlay onClose={() => setShowRevoke(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                <Trash2 size={22} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-extrabold text-slate-900">Revoke Access</h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    This cannot be undone easily.
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                            <p className="text-[13.5px] font-bold text-slate-800">{showRevoke.name}</p>
                            <p className="text-[12px] text-slate-400 mt-0.5">{showRevoke.email}</p>
                        </div>
                        <p className="text-[12.5px] text-slate-400 mb-5">
                            All admin permissions will be removed. They will be downgraded to a regular user.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRevoke(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRevoke}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : "Revoke Access"}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}
        </div>
    );
}

// ─── Sub-Admin Card ───────────────────────────────────────────────────────────

function SubAdminCard({ subAdmin, onEdit, onRevoke }) {
    const perms = subAdmin.permissions ?? {};
    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 p-5"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Avatar + info */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[15px] font-extrabold shrink-0"
                    style={{ background: "linear-gradient(135deg, #3282B8, #0a1628)" }}
                >
                    {subAdmin.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 truncate">{subAdmin.name}</p>
                    <p className="text-[12px] text-slate-400 truncate">{subAdmin.email}</p>
                </div>
            </div>

            {/* Permissions */}
            <div className="space-y-1.5 mb-4">
                {PERMISSIONS.map((p) => {
                    const has = !!perms[p.key];
                    return (
                        <div key={p.key} className="flex items-center gap-2.5">
                            {has ? (
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            ) : (
                                <XCircle size={14} className="text-slate-300 shrink-0" />
                            )}
                            <span
                                className={cn(
                                    "text-[12.5px]",
                                    has ? "text-slate-700 font-medium" : "text-slate-400"
                                )}
                            >
                                {p.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#BFDBFE] text-[12.5px] font-bold text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                >
                    <Edit2 size={13} /> Edit Permissions
                </button>
                <button
                    onClick={onRevoke}
                    className="px-3 py-2 rounded-xl border border-red-200 text-[12.5px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                    Revoke
                </button>
            </div>
        </div>
    );
}

// ─── Permission Row ───────────────────────────────────────────────────────────

function PermissionRow({ perm, checked, onChange }) {
    const Icon = perm.icon;
    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer",
                checked ? "border-[#BFDBFE] bg-[#F0F7FF]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            )}
            onClick={() => onChange(!checked)}
        >
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: perm.bg }}
            >
                <Icon size={16} style={{ color: perm.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800">{perm.label}</p>
                <p className="text-[11.5px] text-slate-400">{perm.desc}</p>
            </div>
            {/* Checkbox style */}
            <div
                className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    checked ? "border-[#3282B8] bg-[#3282B8]" : "border-slate-300 bg-white"
                )}
            >
                {checked && <CheckCircle2 size={12} className="text-white fill-white" />}
            </div>
        </div>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2">
            <Icon size={14} style={{ color: "#3282B8" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#3282B8" }}>
                {label}
            </span>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function Overlay({ onClose, children }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
                {children}
            </div>
        </div>
    );
}

function TableSkeleton({ rows }) {
    return (
        <div className="animate-pulse divide-y divide-slate-50">
            {Array(rows)
                .fill(0)
                .map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4">
                        <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                            <div className="h-2.5 bg-slate-100 rounded-full w-1/4" />
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full w-16" />
                        <div className="h-3 bg-slate-100 rounded-full w-20" />
                        <div className="h-7 bg-slate-100 rounded-lg w-20" />
                    </div>
                ))}
        </div>
    );
}

function EmptyRow({ message }) {
    return (
        <div className="py-16 text-center">
            <Users size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-slate-400">{message}</p>
        </div>
    );
}
