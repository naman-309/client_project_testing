import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    ChevronRight,
    ChevronLeft,
    Download,
    SlidersHorizontal,
    ChevronDown,
    Folder,
} from "lucide-react";
import toast from "react-hot-toast";
import categoryService from "@/services/categoryService";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

const ICON_COLORS = [
    { bg: "#EBF4FF", color: "#3282B8" },
    { bg: "#FFF7ED", color: "#F97316" },
    { bg: "#F0FDF4", color: "#16A34A" },
    { bg: "#FDF2F8", color: "#A855F7" },
    { bg: "#FFFBEB", color: "#F59E0B" },
    { bg: "#FEF2F2", color: "#EF4444" },
];
const colorFor = (id) => ICON_COLORS[id % ICON_COLORS.length];

// ─── Field style ──────────────────────────────────────────────────────────────
const fieldCls =
    "w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13.5px] text-slate-900 bg-[#F8FAFC] focus:outline-none focus:border-[#3282B8] focus:ring-2 focus:ring-[#3282B8]/10 transition-all";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null); // null = create
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await categoryService.getAll();
            setCategories(data?.data?.categories ?? []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ── Flat list for search/filter ────────────────────────────────────────────
    const flatList = useMemo(() => {
        const flat = [];
        categories.forEach((cat) => {
            flat.push({ ...cat, _level: 0 });
            (cat.children ?? []).forEach((child) => {
                flat.push({ ...child, _level: 1 });
            });
        });
        return flat;
    }, [categories]);

    const filtered = useMemo(() => {
        return flatList.filter((c) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
            const matchStatus =
                statusFilter === "all" || (statusFilter === "active" ? c.is_active === 1 : c.is_active !== 1);
            return matchSearch && matchStatus;
        });
    }, [flatList, search, statusFilter]);

    // ── Pagination ─────────────────────────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const parentCount = categories.length;
    const childCount = flatList.filter((c) => c._level === 1).length;

    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };
    const openEdit = (cat) => {
        setEditing(cat);
        setShowForm(true);
    };
    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    const handleSaved = () => {
        closeForm();
        load();
    };

    const handleDelete = async () => {
        try {
            await categoryService.delete(deleteTarget.id);
            toast.success(`"${deleteTarget.name}" deleted`);
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cannot delete — has courses or active children");
        }
    };

    return (
        <div
            className="min-h-screen bg-[#F1F5F9] p-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                <span className="hover:text-slate-600 cursor-pointer">Dashboard</span>
                <ChevronRight size={11} />
                <span className="hover:text-slate-600 cursor-pointer">Courses</span>
                <ChevronRight size={11} />
                <span className="text-[#3282B8]">Categories</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-[13.5px] text-slate-500 mt-1 max-w-md">
                        Manage your curriculum hierarchy, organize course collections, and control global
                        taxonomy visibility.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download size={15} />
                        Export
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors"
                        style={{ background: "#3282B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                    >
                        <Plus size={15} />
                        Create Category
                    </button>
                </div>
            </div>

            {/* Search + filters */}
            <div
                className="bg-white rounded-2xl border border-[#EEF2F7] px-4 py-3.5 mb-5 flex flex-col sm:flex-row gap-3"
                style={{ boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}
            >
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Filter categories by name, ID or tags..."
                        className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-slate-700 bg-[#F8FAFC] focus:outline-none focus:border-[#3282B8] focus:ring-2 focus:ring-[#3282B8]/10 transition-all"
                    />
                </div>
                <div className="flex gap-3 shrink-0">
                    {/* Status dropdown */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="appearance-none pl-4 pr-9 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-slate-600 bg-white focus:outline-none focus:border-[#3282B8] cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                        <SlidersHorizontal size={14} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div
                className="bg-white rounded-2xl border border-[#EEF2F7] overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                {/* Table head */}
                <div
                    className="grid px-6 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]"
                    style={{ gridTemplateColumns: "1fr 130px 80px 110px 100px" }}
                >
                    {["Category Name & Taxonomy", "Hierarchy", "Order", "Status", "Actions"].map((h) => (
                        <span
                            key={h}
                            className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider"
                        >
                            {h}
                        </span>
                    ))}
                </div>

                {loading ? (
                    <TableSkeleton />
                ) : paginated.length === 0 ? (
                    <div className="py-16 text-center">
                        <Folder size={36} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-[14px] font-semibold text-slate-400">No categories found</p>
                    </div>
                ) : (
                    paginated.map((cat) => (
                        <CategoryRow
                            key={cat.id}
                            cat={cat}
                            onEdit={() => openEdit(cat)}
                            onDelete={() => setDeleteTarget(cat)}
                        />
                    ))
                )}

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#F1F5F9]">
                        <p className="text-[12.5px] text-slate-500">
                            Showing <span className="font-bold text-slate-700">{parentCount}</span> main
                            categories and <span className="font-bold text-slate-700">{childCount}</span>{" "}
                            sub-categories
                        </p>
                        {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
                    </div>
                )}
            </div>

            {/* Form modal */}
            {showForm && (
                <CategoryFormModal
                    editing={editing}
                    parents={categories}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    cat={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

function CategoryRow({ cat, onEdit, onDelete }) {
    const isChild = cat._level === 1;
    const isActive = cat.is_active === 1;
    const { bg, color } = colorFor(cat.id);

    return (
        <div
            className={cn(
                "grid px-6 py-4 border-b border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors items-center",
                isChild && "bg-[#FAFBFC]"
            )}
            style={{ gridTemplateColumns: "1fr 130px 80px 110px 100px" }}
        >
            {/* Name & taxonomy */}
            <div className="flex items-center gap-4 min-w-0" style={{ paddingLeft: isChild ? "32px" : "0" }}>
                {isChild ? (
                    <div className="flex items-center gap-2 shrink-0 text-slate-300">
                        <ChevronRight size={14} />
                    </div>
                ) : null}

                {!isChild && (
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-extrabold"
                        style={{ background: bg, color }}
                    >
                        {initials(cat.name)}
                    </div>
                )}

                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p
                            className={cn(
                                "truncate",
                                isChild
                                    ? "text-[13.5px] font-semibold text-slate-700"
                                    : "text-[14px] font-bold text-slate-900"
                            )}
                        >
                            {cat.name}
                        </p>
                        {isChild && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                {initials(cat.name)}
                            </span>
                        )}
                    </div>
                    {cat.description && (
                        <p className="text-[12px] text-slate-400 truncate mt-0.5">{cat.description}</p>
                    )}
                </div>
            </div>

            {/* Hierarchy */}
            <div>
                {!isChild ? (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                        Main Level
                    </span>
                ) : (
                    <span className="text-[12px] text-slate-400">Sub-category</span>
                )}
            </div>

            {/* Order */}
            <p className="text-[13px] font-semibold text-slate-600">
                {String(cat.sort_order ?? 0).padStart(2, "0")}
            </p>

            {/* Status */}
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}
                />
                <span
                    className={cn(
                        "text-[12.5px] font-semibold",
                        isActive ? "text-emerald-600" : "text-slate-400"
                    )}
                >
                    {isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onEdit}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                    title="Edit"
                >
                    <Edit2 size={15} />
                </button>
                <button
                    onClick={onDelete}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

function CategoryFormModal({ editing, parents, onClose, onSaved }) {
    const isEdit = !!editing?.id;

    const [form, setForm] = useState({
        name: editing?.name ?? "",
        description: editing?.description ?? "",
        icon: editing?.icon ?? "",
        sort_order: editing?.sort_order ?? 1,
        parent_id: editing?.parent_id ?? "",
        is_active: editing?.is_active ?? 1,
    });
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                icon: form.icon || undefined,
                sort_order: Number(form.sort_order) || 1,
                parent_id: form.parent_id || undefined,
                is_active: form.is_active,
            };

            if (isEdit) {
                await categoryService.update(editing.id, payload);
                toast.success("Category updated!");
            } else {
                await categoryService.create(payload);
                toast.success("Category created!");
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Overlay onClose={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F1F5F9]">
                    <h3 className="text-[16px] font-extrabold text-slate-900">
                        {isEdit ? "Edit Category" : "Create Category"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit} className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <FormField label="Category Name *">
                        <input
                            type="text"
                            className={fieldCls}
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Cloud Computing"
                        />
                    </FormField>

                    {/* Description */}
                    <FormField label="Description">
                        <textarea
                            rows={2}
                            className={fieldCls}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description..."
                            style={{ resize: "none" }}
                        />
                    </FormField>

                    {/* Icon */}
                    <FormField label="Icon (filename or URL)">
                        <input
                            type="text"
                            className={fieldCls}
                            value={form.icon}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            placeholder="e.g. cloud.png"
                        />
                    </FormField>

                    {/* Parent + Sort order */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Parent Category">
                            <select
                                className={fieldCls}
                                value={form.parent_id}
                                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                            >
                                <option value="">None (Main level)</option>
                                {parents
                                    .filter((p) => p.id !== editing?.id)
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </FormField>
                        <FormField label="Sort Order">
                            <input
                                type="number"
                                min={1}
                                className={fieldCls}
                                value={form.sort_order}
                                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                            />
                        </FormField>
                    </div>

                    {/* Status */}
                    <FormField label="Status">
                        <select
                            className={fieldCls}
                            value={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </FormField>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 transition-colors"
                            style={{ background: "#3282B8" }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.background = "#2a6fa0";
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
                                    {isEdit ? "Update" : "Create"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Overlay>
    );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ cat, onClose, onConfirm }) {
    return (
        <Overlay onClose={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-[380px] shadow-2xl p-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                        <Trash2 size={22} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-extrabold text-slate-900">Delete Category</h3>
                        <p className="text-[12.5px] text-slate-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-[#E2E8F0] mb-5">
                    <p className="text-[13.5px] font-bold text-slate-800">{cat.name}</p>
                    {cat.description && (
                        <p className="text-[12px] text-slate-500 mt-0.5">{cat.description}</p>
                    )}
                </div>

                <p className="text-[12px] text-slate-400 mb-5">
                    Note: Categories with active courses or sub-categories cannot be deleted.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Overlay>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Overlay({ onClose, children }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
        >
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function Pagination({ page, total, onChange }) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
                <ChevronLeft size={14} />
            </button>
            {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={cn(
                        "w-8 h-8 rounded-lg text-[13px] font-bold transition-colors",
                        p === page ? "text-white" : "border border-[#E2E8F0] text-slate-500 hover:bg-slate-50"
                    )}
                    style={p === page ? { background: "#3282B8" } : {}}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === total}
                className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse divide-y divide-[#F8FAFC]">
            {Array(6)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="grid px-6 py-4 items-center gap-4"
                        style={{ gridTemplateColumns: "1fr 130px 80px 110px 100px" }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                                <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                            </div>
                        </div>
                        <div className="h-6 bg-slate-100 rounded-lg w-20" />
                        <div className="h-3 bg-slate-100 rounded-full w-8" />
                        <div className="h-5 bg-slate-100 rounded-full w-16" />
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                        </div>
                    </div>
                ))}
        </div>
    );
}
