import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    ChevronDown,
    ChevronUp,
    Edit2,
    Trash2,
    X,
    Save,
    Loader2,
    BookOpen,
    Clock,
    Video,
    FileText,
    HelpCircle,
    GripVertical,
    ChevronRight,
    PlayCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import sectionService from "@/services/sectionService";
import lessonService from "@/services/lessonService";
import courseService from "@/services/courseService";
import { cn } from "@/lib/utils";
import VideoUpload from "@/components/admin/VideoUpload";

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_TYPES = [
    { value: "video", label: "Video", icon: Video },
    { value: "text", label: "Text", icon: FileText },
    { value: "quiz", label: "Quiz", icon: HelpCircle },
];

const EMPTY_SECTION = { title: "", order_num: 1 };
const EMPTY_LESSON = { title: "", type: "video", duration: "", content: "", order_num: 1, is_free: 0 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors";

function fmtDuration(seconds) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}:${String(s).padStart(2, "0")} MIN` : `${m} MIN`;
}

function totalCourseDuration(sections) {
    let total = 0;
    sections.forEach((sec) => {
        (sec.lessons ?? []).forEach((l) => {
            total += l.duration ?? 0;
        });
    });
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function totalLessons(sections) {
    return sections.reduce((a, s) => a + (s.lessons?.length ?? 0), 0);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CurriculumPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    // Section modal
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editSection, setEditSection] = useState(null);
    const [sectionForm, setSectionForm] = useState(EMPTY_SECTION);
    const [savingSection, setSavingSection] = useState(false);

    // Lesson modal
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editLesson, setEditLesson] = useState(null);
    const [lessonSectionId, setLessonSectionId] = useState(null);
    const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
    const [savingLesson, setSavingLesson] = useState(false);

    // Delete
    const [deletingSection, setDeletingSection] = useState(null);
    const [deletingLesson, setDeletingLesson] = useState(null);

    // ── Load course info ───────────────────────────────────────────────────────
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

    // ── Load sections + lessons ────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await sectionService.getByCourseId(courseId);
            const rawSections = data?.data?.sections ?? [];

            // Fetch lessons for each section in parallel
            const withLessons = await Promise.all(
                rawSections.map(async (sec) => {
                    try {
                        const lr = await lessonService.getBySectionId(sec.id);
                        return { ...sec, lessons: lr.data?.data?.lessons ?? [] };
                    } catch {
                        return { ...sec, lessons: [] };
                    }
                })
            );
            setSections(withLessons);

            // Expand first section by default
            if (withLessons.length > 0) {
                setExpanded({ [withLessons[0].id]: true });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load curriculum");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        load();
    }, [load]);

    // ── Section handlers ───────────────────────────────────────────────────────

    const openCreateSection = () => {
        setEditSection(null);
        setSectionForm({ title: "", order_num: sections.length + 1 });
        setShowSectionModal(true);
    };

    const openEditSection = (sec) => {
        setEditSection(sec);
        setSectionForm({ title: sec.title, order_num: sec.order_num });
        setShowSectionModal(true);
    };

    const handleSaveSection = async (e) => {
        e.preventDefault();
        if (!sectionForm.title.trim()) {
            toast.error("Title required");
            return;
        }
        setSavingSection(true);
        try {
            if (editSection) {
                await sectionService.update(editSection.id, {
                    title: sectionForm.title.trim(),
                    order_num: Number(sectionForm.order_num),
                });
                toast.success("Section updated!");
            } else {
                await sectionService.create({
                    course_id: courseId,
                    title: sectionForm.title.trim(),
                    order_num: Number(sectionForm.order_num),
                });
                toast.success("Section created!");
            }
            setShowSectionModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save section");
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (sec) => {
        setDeletingSection(sec.id);
        try {
            await sectionService.delete(sec.id);
            toast.success("Section deleted!");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cannot delete — remove lessons first");
        } finally {
            setDeletingSection(null);
        }
    };

    // ── Lesson handlers ────────────────────────────────────────────────────────

    const openCreateLesson = (sectionId) => {
        const sec = sections.find((s) => s.id === sectionId);
        setEditLesson(null);
        setLessonSectionId(sectionId);
        setLessonForm({
            ...EMPTY_LESSON,
            order_num: (sec?.lessons?.length ?? 0) + 1,
        });
        setShowLessonModal(true);
    };

    const openEditLesson = (lesson, sectionId) => {
        setEditLesson(lesson);
        setLessonSectionId(sectionId);
        setLessonForm({
            title: lesson.title ?? "",
            type: lesson.type ?? "video",
            duration: lesson.duration ? Math.floor(lesson.duration / 60) : "",
            content: lesson.content ?? "",
            order_num: lesson.order_num ?? 1,
            is_free: lesson.is_free ?? 0,
        });
        setShowLessonModal(true);
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        if (!lessonForm.title.trim()) {
            toast.error("Title required");
            return;
        }
        setSavingLesson(true);
        try {
            const payload = {
                section_id: lessonSectionId,
                title: lessonForm.title.trim(),
                type: lessonForm.type,
                duration: lessonForm.duration ? Number(lessonForm.duration) * 60 : 0,
                content: lessonForm.content?.trim() || " ",
                order_num: Number(lessonForm.order_num),
                is_free: lessonForm.is_free ? 1 : 0,
            };

            if (editLesson) {
                await lessonService.update(editLesson.id, payload);
                toast.success("Lesson updated!");
            } else {
                await lessonService.create(payload);
                toast.success("Lesson created!");
            }
            setShowLessonModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save lesson");
        } finally {
            setSavingLesson(false);
        }
    };

    const handleDeleteLesson = async (lesson) => {
        setDeletingLesson(lesson.id);
        try {
            await lessonService.delete(lesson.id);
            toast.success("Lesson deleted!");
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete lesson");
        } finally {
            setDeletingLesson(null);
        }
    };

    const toggleSection = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
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
                <span className="hover:text-slate-600 cursor-pointer text-slate-500 truncate max-w-[120px]">
                    {course?.title ?? "..."}
                </span>
                <ChevronRight size={11} />
                <span style={{ color: "#3282B8" }}>Curriculum</span>
            </div>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                        Curriculum Builder
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">{course?.title ?? "Loading..."}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={() => navigate(`/courses/${course?.slug}`)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Preview Course
                    </button>
                    <button
                        onClick={openCreateSection}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors"
                        style={{ background: "#3282B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                    >
                        <Plus size={15} /> Add Section
                    </button>
                </div>
            </div>

            {/* ── Stats chips ── */}
            {!loading && sections.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {[
                        {
                            icon: BookOpen,
                            label: `${sections.length} Sections`,
                            ibg: "#EBF4FF",
                            ic: "#3282B8",
                        },
                        {
                            icon: FileText,
                            label: `${totalLessons(sections)} Lessons`,
                            ibg: "#F0FDF4",
                            ic: "#16A34A",
                        },
                        {
                            icon: Clock,
                            label: `${totalCourseDuration(sections)} Duration`,
                            ibg: "#FFFBEB",
                            ic: "#F59E0B",
                        },
                    ].map(({ icon: Icon, label, ibg, ic }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-100"
                            style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
                        >
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: ibg }}
                            >
                                <Icon size={14} style={{ color: ic }} />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">{label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: "#3282B8" }} />
                </div>
            ) : sections.length === 0 ? (
                <EmptyState onAdd={openCreateSection} />
            ) : (
                <div className="space-y-4">
                    {sections.map((sec, sIdx) => (
                        <SectionCard
                            key={sec.id}
                            section={sec}
                            index={sIdx}
                            expanded={!!expanded[sec.id]}
                            onToggle={() => toggleSection(sec.id)}
                            onEdit={() => openEditSection(sec)}
                            onDelete={() => handleDeleteSection(sec)}
                            deleting={deletingSection === sec.id}
                            onAddLesson={() => {
                                openCreateLesson(sec.id);
                                setExpanded((p) => ({ ...p, [sec.id]: true }));
                            }}
                            onEditLesson={(l) => openEditLesson(l, sec.id)}
                            onDeleteLesson={handleDeleteLesson}
                            deletingLesson={deletingLesson}
                        />
                    ))}
                </div>
            )}

            {/* ── Section Modal ── */}
            {showSectionModal && (
                <Overlay onClose={() => setShowSectionModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-slate-900">
                                    {editSection ? "Edit Section" : "Add Section"}
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    {editSection
                                        ? "Update section details"
                                        : "Add a new chapter to the course"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSectionModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSection} className="px-6 py-5 space-y-4">
                            <Field label="Section Title *">
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    value={sectionForm.title}
                                    onChange={(e) => setSectionForm((p) => ({ ...p, title: e.target.value }))}
                                    className={inputCls}
                                    placeholder="e.g. Introduction to AWS"
                                />
                            </Field>
                            <Field label="Order Number">
                                <input
                                    type="number"
                                    min={1}
                                    value={sectionForm.order_num}
                                    onChange={(e) =>
                                        setSectionForm((p) => ({ ...p, order_num: e.target.value }))
                                    }
                                    className={inputCls}
                                />
                            </Field>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSectionModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSection}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                    style={{ background: "#3282B8" }}
                                    onMouseEnter={(e) => {
                                        if (!savingSection) e.currentTarget.style.background = "#2a6fa0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3282B8";
                                    }}
                                >
                                    {savingSection ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            {editSection ? "Update" : "Create"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </Overlay>
            )}

            {/* ── Lesson Modal ── */}
            {showLessonModal && (
                <Overlay onClose={() => setShowLessonModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-slate-900">
                                    {editLesson ? "Edit Lesson" : "Add Lesson"}
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    Configure your new curriculum item
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLessonModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLesson} className="px-6 py-5 space-y-4">
                            {/* Title */}
                            <Field label="Lesson Title">
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                                    className={inputCls}
                                    placeholder="e.g. Masterclass: Spatial Grids"
                                />
                            </Field>

                            {/* Type + Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Lesson Type">
                                    <select
                                        value={lessonForm.type}
                                        onChange={(e) =>
                                            setLessonForm((p) => ({ ...p, type: e.target.value }))
                                        }
                                        className={inputCls}
                                    >
                                        {LESSON_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Duration (Min)">
                                    <input
                                        type="number"
                                        min={0}
                                        value={lessonForm.duration}
                                        onChange={(e) =>
                                            setLessonForm((p) => ({ ...p, duration: e.target.value }))
                                        }
                                        className={inputCls}
                                        placeholder="15"
                                    />
                                </Field>
                            </div>

                            {/* Content / Video URL */}
                            <Field
                                label={
                                    lessonForm.type === "video"
                                        ? "Content / Video URL (S3)"
                                        : lessonForm.type === "text"
                                          ? "Lesson Content"
                                          : "Quiz Reference"
                                }
                            >
                                {lessonForm.type === "video" ? (
                                    <div className="space-y-3">
                                        {/* Video Upload Component */}
                                        <VideoUpload
                                            onUploadComplete={(videoUrl) => {
                                                setLessonForm((p) => ({ ...p, content: videoUrl }));
                                            }}
                                            onUploadError={(error) => {
                                                console.error("Video upload failed:", error);
                                            }}
                                        />

                                        {/* Fallback Manual URL Input */}
                                        <div className="text-center text-xs text-slate-500 my-2">OR</div>
                                        <textarea
                                            rows={2}
                                            value={lessonForm.content}
                                            onChange={(e) =>
                                                setLessonForm((p) => ({ ...p, content: e.target.value }))
                                            }
                                            className={inputCls}
                                            placeholder="Paste S3 video URL manually..."
                                            style={{ resize: "none" }}
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        rows={3}
                                        value={lessonForm.content}
                                        onChange={(e) =>
                                            setLessonForm((p) => ({ ...p, content: e.target.value }))
                                        }
                                        className={inputCls}
                                        placeholder={
                                            lessonForm.type === "text"
                                                ? "Lesson content (Markdown supported)"
                                                : "Quiz ID or reference"
                                        }
                                        style={{ resize: "none" }}
                                    />
                                )}
                            </Field>

                            {/* Order + Free Preview */}
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <Field label="Order Number">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLessonForm((p) => ({
                                                    ...p,
                                                    order_num: Math.max(1, p.order_num - 1),
                                                }))
                                            }
                                            className="w-9 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg font-bold shrink-0"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            value={lessonForm.order_num}
                                            onChange={(e) =>
                                                setLessonForm((p) => ({
                                                    ...p,
                                                    order_num: Number(e.target.value),
                                                }))
                                            }
                                            className="flex-1 py-2.5 text-center rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLessonForm((p) => ({ ...p, order_num: p.order_num + 1 }))
                                            }
                                            className="w-9 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg font-bold shrink-0"
                                        >
                                            +
                                        </button>
                                    </div>
                                </Field>

                                {/* Free Preview toggle */}
                                <div>
                                    <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        Free Preview
                                    </p>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <div
                                            onClick={() =>
                                                setLessonForm((p) => ({ ...p, is_free: p.is_free ? 0 : 1 }))
                                            }
                                            className={cn(
                                                "w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer",
                                                lessonForm.is_free ? "bg-[#10B981]" : "bg-slate-200"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200",
                                                    lessonForm.is_free ? "left-5" : "left-0.5"
                                                )}
                                            />
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-700">
                                            {lessonForm.is_free ? "Enabled" : "Disabled"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-1 border-t border-slate-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLessonModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingLesson}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                                    style={{ background: "#3282B8" }}
                                    onMouseEnter={(e) => {
                                        if (!savingLesson) e.currentTarget.style.background = "#2a6fa0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#3282B8";
                                    }}
                                >
                                    {savingLesson ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            {editLesson ? "Update Lesson" : "Save Lesson"}
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

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
    section,
    index,
    expanded,
    onToggle,
    onEdit,
    onDelete,
    deleting,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
    deletingLesson,
}) {
    const lessons = section.lessons ?? [];
    const secDuration = lessons.reduce((a, l) => a + (l.duration ?? 0), 0);
    const durationStr = fmtDuration(secDuration);

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Section header */}
            <div className="flex items-center gap-4 px-5 py-4">
                {/* Drag handle */}
                <GripVertical size={16} className="text-slate-300 shrink-0 cursor-grab" />

                {/* Number badge */}
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[12px] font-extrabold"
                    style={{ background: "#3282B8" }}
                >
                    §{index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
                    <p className="text-[14.5px] font-bold text-slate-900 truncate">{section.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-slate-400">
                            <PlayCircle size={11} />
                            <span className="text-[11.5px]">{lessons.length} Lessons</span>
                        </div>
                        {durationStr && (
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock size={11} />
                                <span className="text-[11.5px]">{durationStr}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors ml-1"
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Lessons */}
            {expanded && (
                <div className="border-t border-slate-100">
                    {lessons.length === 0 ? (
                        <p className="text-center text-[12.5px] text-slate-400 py-4">
                            No lessons yet — add one below
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {lessons.map((lesson, lIdx) => (
                                <LessonRow
                                    key={lesson.id}
                                    lesson={lesson}
                                    sectionIndex={index}
                                    lessonIndex={lIdx}
                                    onEdit={() => onEditLesson(lesson)}
                                    onDelete={() => onDeleteLesson(lesson)}
                                    deleting={deletingLesson === lesson.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Lesson button */}
                    <button
                        onClick={onAddLesson}
                        className="w-full flex items-center justify-center gap-2 py-3.5 mx-0 border-t border-dashed border-slate-200 text-[13px] font-semibold text-[#3282B8] hover:bg-[#F0F7FF] transition-colors"
                    >
                        <Plus size={15} />
                        Add Lesson
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({ lesson, sectionIndex, lessonIndex, onEdit, onDelete, deleting }) {
    const TypeIcon = LESSON_TYPES.find((t) => t.value === lesson.type)?.icon ?? Video;
    const typeColor = lesson.type === "video" ? "#3282B8" : lesson.type === "text" ? "#F97316" : "#8B5CF6";
    const typeBg = lesson.type === "video" ? "#EBF4FF" : lesson.type === "text" ? "#FFF7ED" : "#F5F3FF";

    return (
        <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors group">
            {/* Drag */}
            <GripVertical size={14} className="text-slate-200 group-hover:text-slate-300 shrink-0" />

            {/* Lesson number */}
            <span className="text-[12px] font-bold text-slate-400 shrink-0 w-6 text-right">
                {sectionIndex + 1}.{lessonIndex + 1}
            </span>

            {/* Type icon */}
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: typeBg }}
            >
                <TypeIcon size={13} style={{ color: typeColor }} />
            </div>

            {/* Title + duration */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{lesson.title}</p>
                {lesson.duration > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{fmtDuration(lesson.duration)}</p>
                )}
            </div>

            {/* Free badge */}
            {lesson.is_free === 1 && (
                <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0] shrink-0">
                    FREE
                </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3282B8] hover:bg-[#EBF4FF] transition-colors"
                >
                    <Edit2 size={13} />
                </button>
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                    {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center gap-4 text-center"
            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            <div className="w-14 h-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center">
                <BookOpen size={26} style={{ color: "#3282B8" }} />
            </div>
            <div>
                <p className="text-[15px] font-bold text-slate-800">No sections yet</p>
                <p className="text-[13px] text-slate-400 mt-1">
                    Start building your curriculum by adding a section
                </p>
            </div>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors"
                style={{ background: "#3282B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
            >
                <Plus size={15} /> Add First Section
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
