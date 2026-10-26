import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, PlayCircle, FileText, HelpCircle, Lock, Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import lessonService from "@/services/lessonService";
import { cn } from "@/lib/utils";

/**
 * CourseCurriculum.jsx
 * Accordion — sections + lazy-loaded lessons per section + free lesson preview modal
 */

function formatDuration(seconds) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return h > 0 ? `${h}h ${rem > 0 ? `${rem}m` : ""}`.trim() : `${m}m`;
}

// ── Lesson type icon ───────────────────────────────────────
function LessonIcon({ type, isLocked }) {
    if (isLocked) return <Lock size={13} style={{ color: "#CBD5E1", flexShrink: 0 }} />;
    const map = {
        video: <PlayCircle size={13} style={{ color: "#2563EB", flexShrink: 0 }} />,
        article: <FileText size={13} style={{ color: "#10B981", flexShrink: 0 }} />,
        quiz: <HelpCircle size={13} style={{ color: "#F59E0B", flexShrink: 0 }} />,
    };
    return map[type] || map.video;
}

// ── Single lesson row ──────────────────────────────────────
function LessonRow({ lesson, isEnrolled, onSelectLesson }) {
    const isLocked = !lesson.is_free && !isEnrolled;
    const duration = formatDuration(lesson.duration);

    return (
        <div
            onClick={() => onSelectLesson?.(lesson)}
            className={cn(
                "flex items-center gap-3 px-5 py-3 select-none",
                "border-b last:border-0",
                isLocked
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer group transition-colors duration-150 hover:bg-[#F8FAFF]"
            )}
            style={{ borderColor: "#F1F5F9" }}
        >
            <LessonIcon type={lesson.type} isLocked={isLocked} />

            <span
                className={cn(
                    "flex-1 leading-snug",
                    !isLocked && "group-hover:text-primary transition-colors duration-150"
                )}
                style={{
                    fontSize: "13px",
                    fontWeight: isLocked ? 400 : 500,
                    color: isLocked ? "#94A3B8" : "#0F172A",
                }}
            >
                {lesson.title}
            </span>

            {/* Free preview badge */}
            {lesson.is_free === 1 && !isEnrolled && (
                <span
                    className="flex items-center gap-1 shrink-0 transition-transform group-hover:scale-105"
                    style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        color: "#2563EB",
                        background: "#EFF6FF",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        border: "1px solid #BFDBFE",
                    }}
                >
                    <Eye size={11} /> Preview
                </span>
            )}

            {/* Duration */}
            {duration && (
                <span style={{ fontSize: "11.5px", color: "#94A3B8", flexShrink: 0 }}>{duration}</span>
            )}
        </div>
    );
}

// ── Single section ─────────────────────────────────────────
function SectionRow({ section, index, isEnrolled, onSelectLesson }) {
    const [open, setOpen] = useState(index === 0);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || lessons.length > 0) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await lessonService.getBySectionId(section.id);
                setLessons(data.data.lessons);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [open]);

    const totalDuration = lessons.reduce((s, l) => s + (l.duration || 0), 0);
    const duration = formatDuration(totalDuration);

    return (
        <div
            className="rounded-xl overflow-hidden transition-all duration-200"
            style={{
                border: open ? "1px solid #BFDBFE" : "1px solid #EEF2F7",
            }}
        >
            {/* Section header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150"
                style={{ background: open ? "#EFF6FF" : "#F8FAFC" }}
                onMouseEnter={(e) => {
                    if (!open) e.currentTarget.style.background = "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                    if (!open) e.currentTarget.style.background = "#F8FAFC";
                }}
            >
                {/* Section number */}
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: open ? "#2563EB" : "#94A3B8",
                        width: "24px",
                        flexShrink: 0,
                        letterSpacing: "0.02em",
                    }}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                    <p
                        style={{
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: open ? "#1D4ED8" : "#0F172A",
                            lineHeight: 1.3,
                        }}
                        className="truncate"
                    >
                        {section.title}
                    </p>
                    {(lessons.length > 0 || loading) && (
                        <p style={{ fontSize: "11.5px", color: "#94A3B8", marginTop: "3px" }}>
                            {loading
                                ? "Loading..."
                                : `${lessons.length} lesson${lessons.length !== 1 ? "s" : ""}${duration ? ` · ${duration}` : ""}`}
                        </p>
                    )}
                </div>

                {/* Chevron */}
                {open ? (
                    <ChevronUp size={15} style={{ color: "#2563EB", flexShrink: 0 }} />
                ) : (
                    <ChevronDown size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
                )}
            </button>

            {/* Lessons list */}
            {open && (
                <div style={{ background: "#fff" }}>
                    {loading ? (
                        // Skeleton
                        <div className="px-5 py-4 space-y-3">
                            {Array(3)
                                .fill(0)
                                .map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-3.5 h-3.5 rounded-full bg-[#F1F5F9] shrink-0" />
                                        <div className="h-3 bg-[#F1F5F9] rounded-full flex-1" />
                                        <div className="h-3 bg-[#F1F5F9] rounded-full w-10 shrink-0" />
                                    </div>
                                ))}
                        </div>
                    ) : lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                isEnrolled={isEnrolled}
                                onSelectLesson={onSelectLesson}
                            />
                        ))
                    ) : (
                        <p
                            style={{
                                padding: "16px 20px",
                                fontSize: "13px",
                                color: "#94A3B8",
                                fontStyle: "italic",
                            }}
                        >
                            No lessons yet
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────
export default function CourseCurriculum({ sections = [], isEnrolled = false, courseId }) {
    const navigate = useNavigate();
    const [previewLesson, setPreviewLesson] = useState(null);

    const handleLessonClick = (lesson) => {
        if (isEnrolled) {
            if (courseId) {
                navigate(`/student/course/${courseId}/learn`);
            }
            return;
        }

        if (lesson.is_free === 1) {
            if (!lesson.content) {
                toast.error("Preview video content is not yet available for this lecture.");
                return;
            }
            setPreviewLesson(lesson);
        } else {
            toast("Enroll in this course to access this lecture.", {
                icon: "🔒",
                style: {
                    borderRadius: "10px",
                    background: "#0F172A",
                    color: "#fff",
                    fontSize: "13px",
                },
            });
        }
    };

    if (sections.length === 0) {
        return (
            <p style={{ fontSize: "13px", color: "#94A3B8", fontStyle: "italic", padding: "8px 0" }}>
                Curriculum not available yet.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-2.5">
                {sections.map((section, index) => (
                    <SectionRow
                        key={section.id}
                        section={section}
                        index={index}
                        isEnrolled={isEnrolled}
                        onSelectLesson={handleLessonClick}
                    />
                ))}
            </div>

            {/* Free Lecture Preview Modal */}
            {previewLesson && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)" }}
                    onClick={() => setPreviewLesson(null)}
                >
                    <div
                        className="relative w-full max-w-3xl bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#162238]">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                                    Free Preview Lecture
                                </span>
                                <h3 className="text-sm font-medium text-white truncate">
                                    {previewLesson.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setPreviewLesson(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                                aria-label="Close preview"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Player or text content */}
                        {previewLesson.type === "video" ? (
                            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                                <video
                                    src={previewLesson.content}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="p-6 max-h-[60vh] overflow-y-auto text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-[#0B132B]">
                                {previewLesson.content}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
