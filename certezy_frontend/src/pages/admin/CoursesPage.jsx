// src/pages/admin/CoursesPage.jsx

import { useState, useEffect, useCallback } from "react";
import {
    BookOpen,
    Search,
    Download,
    Plus,
    Star,
    Users,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import courseService from "@/services/courseService";
import categoryService from "@/services/categoryService";
import { VideoUpload } from "@/components/admin/VideoUpload";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ["beginner", "intermediate", "advanced"];
const STATUSES = ["draft", "published", "archived"];
const PER_PAGE = 10;

const STATUS_STYLE = {
    published: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "PUBLISHED" },
    draft: { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", label: "DRAFT" },
    archived: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100", label: "ARCHIVED" },
};

const LEVEL_STYLE = {
    beginner: "bg-gray-100 text-gray-700",
    intermediate: "bg-blue-50 text-blue-700",
    advanced: "bg-purple-50 text-purple-700",
};

const EMPTY_FORM = {
    title: "",
    slug: "",
    description: "",
    short_desc: "",
    category_id: "",
    thumbnail: "",
    preview_video: "",
    price: "",
    level: "beginner",
    language: "English",
    status: "draft",
    is_featured: false,
    requirements: "",
    what_you_learn: "",
    certificate_eligible: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);
const fmtPrice = (p) => (p == null || p === 0 ? "Free" : `$${Number(p).toLocaleString("en-US")}`);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [level, setLevel] = useState("");
    const [catId, setCatId] = useState("");
    const [selectedParent, setSelectedParent] = useState("");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formParent, setFormParent] = useState("");
    const [formChild, setFormChild] = useState("");

    // Delete
    const [deleting, setDeleting] = useState(null);

    // Status modal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const totalPages = Math.ceil(totalCount / PER_PAGE);
    const navigate = useNavigate();

    // ── Category helpers ──────────────────────────────────────────────────────

    const getChildCategories = (parentId) => {
        const parent = categories.find((c) => c.id === Number(parentId));
        return parent?.children || [];
    };

    const getFormSelectedCategory = () => {
        if (formChild) return categories.find((c) => c.id === Number(formChild));
        if (formParent) return categories.find((c) => c.id === Number(formParent));
        return null;
    };

    const populateFormCategories = (course) => {
        if (!course.category_id) {
            setFormParent("");
            setFormChild("");
            return;
        }
        const isChild = categories.some((c) => c.children?.some((child) => child.id === course.category_id));
        if (isChild) {
            const parent = categories.find((c) =>
                c.children?.some((child) => child.id === course.category_id)
            );
            if (parent) {
                setFormParent(parent.id.toString());
                setFormChild(course.category_id.toString());
            }
        } else {
            setFormParent(course.category_id.toString());
            setFormChild("");
        }
    };

    // ── Load categories ───────────────────────────────────────────────────────
    useEffect(() => {
        categoryService
            .getAll()
            .then((r) => setCategories(r.data?.data?.categories ?? []))
            .catch(() => {});
    }, []);

    // ── Load courses ──────────────────────────────────────────────────────────
    const loadCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: PER_PAGE,
                ...(search && { search }),
                ...(level && { level }),
                ...(catId && { category_id: Number(catId) }),
                ...(status && { status }),
            };
            const r = await courseService.getAll(params);
            const courses = r.data?.data;
            const pagination = r.data?.pagination;
            setCourses(Array.isArray(courses) ? courses : []);
            setTotalCount(pagination?.total ?? (Array.isArray(courses) ? courses.length : 0));
        } catch (e) {
            setError(e.response?.data?.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    }, [page, search, status, level, catId]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);
    useEffect(() => {
        setPage(1);
    }, [search, status, level, catId]);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const stats = {
        total: totalCount,
        published: courses.filter((c) => c.status === "published").length,
        draft: courses.filter((c) => c.status === "draft").length,
        enrolled: courses.reduce((s, c) => s + (c.enrolled_count ?? 0), 0),
    };

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditCourse(null);
        setForm(EMPTY_FORM);
        setFormParent("");
        setFormChild("");
        setShowModal(true);
    };

    const openEdit = (course) => {
        setEditCourse(course);
        setForm({
            title: course.title ?? "",
            slug: course.slug ?? "",
            description: course.description ?? "",
            short_desc: course.short_desc ?? "",
            category_id: course.category_id ?? "",
            thumbnail: course.thumbnail ?? "",
            preview_video: course.preview_video ?? "",
            price: course.price ?? "",
            level: course.level ?? "beginner",
            language: course.language ?? "English",
            status: course.status ?? "draft",
            is_featured: !!course.is_featured,
            requirements: course.requirements ?? "",
            what_you_learn: course.what_you_learn ?? "",
            certificate_eligible: course.certificate_eligible ?? 0,
        });
        populateFormCategories(course);
        setShowModal(true);
    };

    const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (form.title.trim().length < 3) {
            toast.error("Title min 3 characters");
            return;
        }
        if (!form.category_id) {
            toast.error("Category is required");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                slug: form.slug?.trim() || undefined,
                description: form.description?.trim() || undefined,
                short_desc: form.short_desc?.trim() || undefined,
                category_id: Number(form.category_id),
                thumbnail: form.thumbnail?.trim() || undefined,
                preview_video: form.preview_video?.trim() || undefined,
                price: form.price === "" ? 0 : Number(form.price),
                level: form.level || "beginner",
                language: form.language?.trim() || "English",
                status: form.status || "draft",
                is_featured: Boolean(form.is_featured),
                requirements: form.requirements?.trim() || undefined,
                what_you_learn: form.what_you_learn?.trim() || undefined,
                certificate_eligible: Number(form.certificate_eligible) || 0,
            };

            if (editCourse) {
                await courseService.update(editCourse.id, payload);
                toast.success("Course updated successfully!");
            } else {
                await courseService.create(payload);
                toast.success("Course created successfully!");
            }
            setShowModal(false);
            loadCourses();
        } catch (err) {
            const st = err.response?.status;
            if (st === 409) toast.error("Slug/title already exists.");
            else if (st === 400) toast.error(err.response?.data?.message || "Invalid data.");
            else if (st === 401 || st === 403) toast.error("Not authorized.");
            else toast.error(err.response?.data?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course) => {
        setDeleting(course.id);
        try {
            await courseService.delete(course.id);
            toast.success("Course deleted!");
            loadCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleFeatured = async (course) => {
        try {
            await courseService.update(course.id, { is_featured: !course.is_featured });
            toast.success(`Course ${!course.is_featured ? "featured" : "unfeatured"}!`);
            loadCourses();
        } catch {
            toast.error("Failed to update");
        }
    };

    const handleStatusChange = async (course, newStatus) => {
        try {
            await courseService.update(course.id, { status: newStatus });
            toast.success(`Course ${newStatus}!`);
            loadCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const getStatusOptions = (currentStatus) => {
        const map = {
            published: [
                {
                    value: "draft",
                    label: "Unpublish",
                    icon: "📝",
                    color: "yellow",
                    desc: "Make invisible to students",
                },
                { value: "archived", label: "Archive", icon: "📦", color: "red", desc: "Archive course" },
            ],
            draft: [
                {
                    value: "published",
                    label: "Publish",
                    icon: "✅",
                    color: "green",
                    desc: "Make visible to students",
                },
                { value: "archived", label: "Archive", icon: "📦", color: "red", desc: "Archive course" },
            ],
            archived: [
                { value: "draft", label: "Restore", icon: "🔄", color: "blue", desc: "Restore to draft" },
            ],
        };
        return map[currentStatus] ?? [];
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Dashboard › <span style={{ color: "#3282B8" }}>Courses</span>
                    </p>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Courses</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your course catalog and content</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                        <Download size={15} /> Export
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors whitespace-nowrap"
                        style={{ background: "#3282B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                    >
                        <Plus size={16} /> Create Course
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 2xl:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Courses",
                        value: stats.total,
                        sub: "All courses",
                        subColor: "text-[#3282B8]",
                        icon: BookOpen,
                        ibg: "#EBF4FF",
                        ic: "#3282B8",
                    },
                    {
                        label: "Published",
                        value: stats.published,
                        sub: "Active in catalog",
                        subColor: "text-green-600",
                        icon: CheckCircle2,
                        ibg: "#F0FDF4",
                        ic: "#22C55E",
                    },
                    {
                        label: "Draft",
                        value: stats.draft,
                        sub: "Ready to review",
                        subColor: "text-yellow-600",
                        icon: Edit2,
                        ibg: "#FFFBEB",
                        ic: "#F59E0B",
                    },
                    {
                        label: "Total Enrolled",
                        value: fmt(stats.enrolled),
                        sub: "Active learners",
                        subColor: "text-purple-600",
                        icon: Users,
                        ibg: "#F5F3FF",
                        ic: "#8B5CF6",
                    },
                ].map(({ label, value, sub, subColor, icon: Icon, ibg, ic }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5"
                        style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-500 mb-1 truncate">{label}</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                                    {value}
                                </p>
                                <p className={`text-xs font-medium mt-1.5 truncate ${subColor}`}>{sub}</p>
                            </div>
                            <div
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: ibg }}
                            >
                                <Icon size={17} style={{ color: ic }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filters ── */}
            <div
                className="bg-white rounded-2xl border border-slate-100 p-4"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                <div className="flex flex-col gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by course title, instructor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                        />
                    </div>
                    {/* Filters row */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-[#3282B8] cursor-pointer"
                        >
                            <option value="">All Status</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-[#3282B8] cursor-pointer"
                        >
                            <option value="">All Levels</option>
                            {LEVELS.map((l) => (
                                <option key={l} value={l}>
                                    {l.charAt(0).toUpperCase() + l.slice(1)}
                                </option>
                            ))}
                        </select>
                        {/* Parent category */}
                        <select
                            value={selectedParent}
                            onChange={(e) => {
                                setSelectedParent(e.target.value);
                                setCatId("");
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-[#3282B8] cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories
                                .filter((c) => !c.parent_id)
                                .map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                        </select>
                        {/* Child category */}
                        {selectedParent && getChildCategories(selectedParent).length > 0 && (
                            <select
                                value={catId}
                                onChange={(e) => setCatId(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-[#3282B8] cursor-pointer"
                            >
                                <option value="">All Sub-Categories</option>
                                {getChildCategories(selectedParent).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin" style={{ color: "#3282B8" }} />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <AlertCircle size={28} className="text-red-500" />
                        <p className="text-sm font-medium text-red-600 text-center px-4">{error}</p>
                        <button
                            onClick={loadCourses}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: "#3282B8" }}
                        >
                            Retry
                        </button>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <BookOpen size={32} className="text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No courses found</p>
                        <button
                            onClick={openCreate}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: "#3282B8" }}
                        >
                            Create First Course
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] 2xl:min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {[
                                        { label: "COURSE", cls: "" },
                                        { label: "INSTRUCTOR", cls: "hidden 2xl:table-cell" },
                                        { label: "LEVEL", cls: "" },
                                        { label: "PRICE", cls: "" },
                                        { label: "STUDENTS", cls: "hidden 2xl:table-cell" },
                                        { label: "STATUS", cls: "" },
                                        { label: "FEATURED", cls: "hidden 2xl:table-cell" },
                                        { label: "ACTIONS", cls: "" },
                                    ].map(({ label, cls }) => (
                                        <th
                                            key={label}
                                            className={`text-left py-3 px-4 text-[10.5px] font-bold text-slate-400 tracking-widest uppercase whitespace-nowrap ${cls}`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {courses.map((course) => {
                                    const s = STATUS_STYLE[course.status] ?? STATUS_STYLE.draft;
                                    return (
                                        <tr
                                            key={course.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            {/* Course */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                                        {course.thumbnail ? (
                                                            <img
                                                                src={course.thumbnail}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <BookOpen size={15} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-bold text-slate-900 truncate max-w-[180px] lg:max-w-[240px]">
                                                            {course.title}
                                                        </p>
                                                        <p
                                                            className="text-[11px] font-semibold uppercase tracking-wider mt-0.5 truncate max-w-[180px]"
                                                            style={{ color: "#3282B8" }}
                                                        >
                                                            {course.category_name ?? "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Instructor */}
                                            <td className="py-3.5 px-4 hidden 2xl:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                                                        {(course.instructor_name ?? "?")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="text-[13px] text-slate-700 whitespace-nowrap">
                                                        {course.instructor_name ?? "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Level */}
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${LEVEL_STYLE[course.level] ?? "bg-gray-100 text-gray-600"}`}
                                                >
                                                    {course.level ?? "—"}
                                                </span>
                                            </td>
                                            {/* Price */}
                                            <td className="py-3.5 px-4 text-[13px] font-bold text-slate-800 whitespace-nowrap">
                                                {fmtPrice(course.price)}
                                            </td>
                                            {/* Students */}
                                            <td className="py-3.5 px-4 text-[13px] text-slate-700 hidden 2xl:table-cell">
                                                {(course.enrolled_count ?? 0).toLocaleString()}
                                            </td>
                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-opacity hover:opacity-75 ${s.bg} ${s.text}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                    {s.label}
                                                </button>
                                            </td>
                                            {/* Featured */}
                                            <td className="py-3.5 px-4 hidden 2xl:table-cell">
                                                <button
                                                    onClick={() => handleToggleFeatured(course)}
                                                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <Star
                                                        size={16}
                                                        className={
                                                            course.is_featured
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-slate-300"
                                                        }
                                                    />
                                                </button>
                                            </td>
                                            {/* Actions */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/admin/courses/${course.id}/curriculum`)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                        title="Curriculum"
                                                    >
                                                        <BookOpen size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/admin/courses/${course.id}/tests`)
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                        title="Tests"
                                                    >
                                                        <ClipboardList size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(course)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-[#EBF4FF] hover:text-[#3282B8] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(course)}
                                                        disabled={deleting === course.id}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleting === course.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
                        <p className="text-[13px] text-slate-500 text-center sm:text-left">
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)} of{" "}
                            {totalCount} results
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                                        page === p
                                            ? "text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                    style={page === p ? { background: "#3282B8" } : {}}
                                >
                                    {p}
                                </button>
                            ))}
                            {totalPages > 5 && (
                                <>
                                    <span className="text-slate-400 text-sm">...</span>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                                            page === totalPages
                                                ? "text-white"
                                                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                        style={page === totalPages ? { background: "#3282B8" } : {}}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ── */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                    <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="text-[17px] font-extrabold text-slate-900">
                                    {editCourse ? "Edit Course" : "Create Course"}
                                </h2>
                                <p className="text-[12.5px] text-slate-500 mt-0.5">
                                    {editCourse
                                        ? "Update course details"
                                        : "Fill in the details to create a new course"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
                            {/* Title + Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="TITLE *">
                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) => setF("title", e.target.value)}
                                        className={inputCls}
                                        placeholder="Course title"
                                    />
                                </Field>
                                <Field label="CATEGORY *">
                                    <div className="space-y-2">
                                        <select
                                            required
                                            value={formParent}
                                            onChange={(e) => {
                                                setFormParent(e.target.value);
                                                setFormChild("");
                                                setF("category_id", e.target.value);
                                            }}
                                            className={inputCls}
                                        >
                                            <option value="">Select Category</option>
                                            {categories
                                                .filter((c) => !c.parent_id)
                                                .map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                        </select>
                                        {formParent && getChildCategories(formParent).length > 0 && (
                                            <select
                                                value={formChild}
                                                onChange={(e) => {
                                                    setFormChild(e.target.value);
                                                    setF("category_id", e.target.value || formParent);
                                                }}
                                                className={inputCls}
                                            >
                                                <option value="">Select Sub-Category</option>
                                                {getChildCategories(formParent).map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {getFormSelectedCategory() && (
                                            <p className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                                Selected:{" "}
                                                <span className="font-semibold text-slate-600">
                                                    {getFormSelectedCategory().name}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </Field>
                            </div>

                            {/* Slug */}
                            <Field label="SLUG">
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setF("slug", e.target.value)}
                                    className={inputCls}
                                    placeholder="auto-generated-if-empty"
                                />
                            </Field>

                            {/* Short desc */}
                            <Field label="SHORT DESCRIPTION">
                                <textarea
                                    value={form.short_desc}
                                    rows={2}
                                    onChange={(e) => setF("short_desc", e.target.value)}
                                    className={inputCls}
                                    placeholder="Brief description (max 500 chars)"
                                    maxLength={500}
                                />
                            </Field>

                            {/* Description */}
                            <Field label="DESCRIPTION">
                                <textarea
                                    value={form.description}
                                    rows={3}
                                    onChange={(e) => setF("description", e.target.value)}
                                    className={inputCls}
                                    placeholder="Full course description"
                                />
                            </Field>

                            {/* Thumbnail + Preview video */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="THUMBNAIL URL">
                                    <input
                                        type="url"
                                        value={form.thumbnail}
                                        onChange={(e) => setF("thumbnail", e.target.value)}
                                        className={inputCls}
                                        placeholder="https://..."
                                    />
                                </Field>
                                <Field label="PREVIEW VIDEO">
                                    <div className="space-y-3">
                                        {/* New Video Upload Component */}
                                        <VideoUpload
                                            onUploadComplete={(videoUrl) => {
                                                setF("preview_video", videoUrl);
                                            }}
                                            onUploadError={(error) => {
                                                console.error("Preview video upload failed:", error);
                                            }}
                                        />

                                        {/* Fallback Manual URL Input */}
                                        <div className="text-center text-xs text-slate-500 my-2">OR</div>
                                        <input
                                            type="url"
                                            value={form.preview_video}
                                            onChange={(e) => setF("preview_video", e.target.value)}
                                            className={inputCls}
                                            placeholder="Paste video URL manually..."
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* Price + Level + Language + Status */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Field label="PRICE ($)">
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.price}
                                        onChange={(e) => setF("price", e.target.value)}
                                        className={inputCls}
                                        placeholder="0"
                                    />
                                </Field>
                                <Field label="LEVEL">
                                    <select
                                        value={form.level}
                                        onChange={(e) => setF("level", e.target.value)}
                                        className={inputCls}
                                    >
                                        {LEVELS.map((l) => (
                                            <option key={l} value={l}>
                                                {l.charAt(0).toUpperCase() + l.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="LANGUAGE">
                                    <input
                                        type="text"
                                        value={form.language}
                                        onChange={(e) => setF("language", e.target.value)}
                                        className={inputCls}
                                        placeholder="English"
                                    />
                                </Field>
                                <Field label="STATUS">
                                    <select
                                        value={form.status}
                                        onChange={(e) => setF("status", e.target.value)}
                                        className={inputCls}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Requirements + What you learn */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="REQUIREMENTS">
                                    <textarea
                                        value={form.requirements}
                                        rows={2}
                                        onChange={(e) => setF("requirements", e.target.value)}
                                        className={inputCls}
                                        placeholder="Course requirements..."
                                    />
                                </Field>
                                <Field label="WHAT YOU'LL LEARN">
                                    <textarea
                                        value={form.what_you_learn}
                                        rows={2}
                                        onChange={(e) => setF("what_you_learn", e.target.value)}
                                        className={inputCls}
                                        placeholder="Learning outcomes..."
                                    />
                                </Field>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-6">
                                <Toggle
                                    label="Featured Course"
                                    checked={form.is_featured}
                                    onChange={(v) => setF("is_featured", v)}
                                />
                                <Toggle
                                    label="Certificate Eligible"
                                    checked={!!form.certificate_eligible}
                                    onChange={(v) => setF("certificate_eligible", v ? 1 : 0)}
                                />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
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
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        {editCourse ? "Update Course" : "Create Course"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Status Modal ── */}
            {showStatusModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-[15px] font-extrabold text-slate-900">Change Status</h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-xs text-slate-400 mb-1">Course</p>
                            <p className="text-[13.5px] font-bold text-slate-900 mb-4 line-clamp-2">
                                {selectedCourse.title}
                            </p>
                            <div className="space-y-2">
                                {getStatusOptions(selectedCourse.status).map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            handleStatusChange(selectedCourse, opt.value);
                                            setShowStatusModal(false);
                                        }}
                                        className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors"
                                    >
                                        <span className="text-lg">{opt.icon}</span>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-800">
                                                {opt.label}
                                            </p>
                                            <p className="text-[11.5px] text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 pb-4">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="w-full py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

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

function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                    checked ? "bg-[#3282B8]" : "bg-slate-200"
                )}
            >
                <div
                    className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200",
                        checked ? "left-5" : "left-0.5"
                    )}
                />
            </div>
            <span className="text-[13px] font-medium text-slate-700">{label}</span>
        </label>
    );
}
