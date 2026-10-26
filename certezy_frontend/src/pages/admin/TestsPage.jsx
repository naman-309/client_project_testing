import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Loader2,
    Clock,
    Target,
    List,
    ChevronRight,
    ClipboardList,
    CheckCircle2,
    HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import courseService from "@/services/courseService";
import { cn } from "@/lib/utils";
import api from "@/services/api";

// ─── Inline test service ───────────────────────────────────────────────────────
const testService = {
    getByCourseId: (courseId) => api.get(`/tests/course/${courseId}`),
    create: (data) => api.post("/tests/create", data),
    update: (id, data) => api.put(`/tests/update/${id}`, data),
    delete: (id) => api.delete(`/tests/delete/${id}`),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

const EMPTY_FORM = {
    title: "",
    type: "practice",
    duration: 60,
    pass_percentage: 70,
    status: "active",
};

const TYPE_STYLE = {
    practice: { label: "PRACTICE", bg: "#EBF4FF", color: "#3282B8" },
    certification: { label: "CERTIFICATION", bg: "#F5F3FF", color: "#8B5CF6" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TestsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editTest, setEditTest] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // ── Load course ────────────────────────────────────────────────────────────
    useEffect(() => {
        courseService
            .getAll({ limit: 200 })
            .then((r) => {
                const list = r.data?.data ?? [];
                const found = Array.isArray(list)
                    ? list.find((c) => String(c.id) === String(courseId))
                    : null;
                setCourse(found ?? { id: courseId, title: "Course" });
            })
            .catch(() => setCourse({ id: courseId, title: "Course" }));
    }, [courseId]);

    // ── Load tests ─────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await testService.getByCourseId(courseId);
            setTests(data?.data?.tests ?? []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load tests");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        load();
    }, [load]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalTests = tests.length;
    const activeTests = tests.filter((t) => t.status === "active").length;
    const totalQuestions = tests.reduce((a, t) => a + (t.total_questions ?? 0), 0);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTest(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (test) => {
        setEditTest(test);
        setForm({
            title: test.title ?? "",
            type: test.type ?? "practice",
            duration: test.duration ?? 60,
            pass_percentage: test.pass_percentage ?? 70,
            status: test.status ?? "active",
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error("Title required");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                type: form.type,
                duration: Number(form.duration),
                pass_percentage: Number(form.pass_percentage),
                status: form.status,
                ...(!editTest && { course_id: courseId }),
            };
            if (editTest) {
                await testService.update(editTest.id, payload);
                toast.success("Test updated!");
            } else {
                await testService.create(payload);
                toast.success("Test created!");
            }
            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (test) => {
        setDeletingId(test.id);
        try {
            await testService.delete(test.id);
            toast.success("Test deleted!");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex-wrap">
                <span
                    className="hover:text-slate-600 cursor-pointer"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    Dashboard
                </span>
                <ChevronRight size={11} />
                <span
                    className="hover:text-slate-600 cursor-pointer"
                    onClick={() => navigate("/admin/courses")}
                >
                    Courses
                </span>
                <ChevronRight size={11} />
                <span className="hover:text-slate-600 cursor-pointer text-slate-500 truncate max-w-[100px]">
                    {course?.title ?? "..."}
                </span>
                <ChevronRight size={11} />
                <span style={{ color: "#3282B8" }}>Tests</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                        {course?.title ?? "Loading..."}
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Manage assessments and examination standards for this certification.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0 transition-colors"
                    style={{ background: "#3282B8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                >
                    <Plus size={15} /> + Create Test
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: "Total Tests",
                        value: totalTests,
                        sub: "",
                        icon: ClipboardList,
                        ibg: "#EBF4FF",
                        ic: "#3282B8",
                    },
                    {
                        label: "Active Now",
                        value: activeTests,
                        sub: "",
                        icon: CheckCircle2,
                        ibg: "#F0FDF4",
                        ic: "#16A34A",
                    },
                    {
                        label: "Total Questions",
                        value: totalQuestions,
                        sub: "",
                        icon: HelpCircle,
                        ibg: "#FFFBEB",
                        ic: "#F59E0B",
                    },
                ].map(({ label, value, icon: Icon, ibg, ic }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-slate-100 p-5"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: ibg }}
                            >
                                <Icon size={20} style={{ color: ic }} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="text-[28px] font-extrabold text-slate-900 leading-none mt-0.5">
                                    {value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tests list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#3282B8" }} />
                </div>
            ) : tests.length === 0 ? (
                <EmptyState onAdd={openCreate} />
            ) : (
                <div className="space-y-4">
                    {tests.map((test) => (
                        <TestCard
                            key={test.id}
                            test={test}
                            onEdit={() => openEdit(test)}
                            onDelete={() => handleDelete(test)}
                            deleting={deletingId === test.id}
                            onManage={() => navigate(`/admin/tests/${test.id}/questions`)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <Overlay onClose={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-slate-900">
                                    {editTest ? "Edit Test" : "Create Test"}
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    {editTest ? "Update test configuration" : "Add a new test to this course"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            <Field label="Test Title *">
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    value={form.title}
                                    onChange={(e) => setF("title", e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. AWS Fundamentals Quiz"
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Test Type">
                                    <select
                                        value={form.type}
                                        onChange={(e) => setF("type", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="practice">Practice</option>
                                        <option value="certification">Certification</option>
                                    </select>
                                </Field>
                                <Field label="Status">
                                    <select
                                        value={form.status}
                                        onChange={(e) => setF("status", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Duration (min)">
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.duration}
                                        onChange={(e) => setF("duration", e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Pass Percentage (%)">
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={form.pass_percentage}
                                        onChange={(e) => setF("pass_percentage", e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60"
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
                                            <Save size={14} />
                                            {editTest ? "Update" : "Create"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Overlay>
            )}
        </div>
    );
}

// ─── Test Card ────────────────────────────────────────────────────────────────

function TestCard({ test, onEdit, onDelete, deleting, onManage }) {
    const typeStyle = TYPE_STYLE[test.type] ?? TYPE_STYLE.practice;
    const isActive = test.status === "active";

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Icon placeholder */}
            <div
                className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-white text-[20px] font-extrabold"
                style={{ background: "linear-gradient(135deg, #0a1628, #162d5a)" }}
            >
                {test.title?.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-[15px] font-extrabold text-slate-900">{test.title}</h3>
                    <span
                        className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                        {typeStyle.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-green-500" : "bg-slate-300"
                            )}
                        />
                        <span
                            className={cn(
                                "text-[11.5px] font-bold uppercase tracking-wider",
                                isActive ? "text-green-600" : "text-slate-400"
                            )}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <StatChip icon={Clock} label={`${test.duration ?? 60} min`} />
                    <StatChip icon={Target} label={`${test.pass_percentage ?? 70}% passing score`} />
                    <StatChip icon={List} label={`${test.total_questions ?? 0} questions`} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={onManage}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                    Manage Questions
                </button>
                <button
                    onClick={onEdit}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#3282B8] hover:bg-[#EBF4FF] hover:border-[#BFDBFE] transition-colors"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
            </div>
        </div>
    );
}

function StatChip({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-1.5 text-slate-500">
            <Icon size={13} />
            <span className="text-[12.5px]">{label}</span>
        </div>
    );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center gap-4 text-center"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            <div className="w-14 h-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center">
                <ClipboardList size={26} style={{ color: "#3282B8" }} />
            </div>
            <div>
                <p className="text-[15px] font-bold text-slate-800">No tests yet</p>
                <p className="text-[13px] text-slate-400 mt-1">Create your first test for this course</p>
            </div>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: "#3282B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
            >
                <Plus size={15} /> Create Test
            </button>
        </div>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

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

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
