import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, CheckCircle2, Clock, Search, SlidersHorizontal, Award } from "lucide-react";

import enrollmentService from "@/services/enrollmentService";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds) {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
    { key: "all", label: "All Courses" },
    { key: "inprogress", label: "In Progress" },
    { key: "completed", label: "Completed" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await enrollmentService.getMyEnrollments();
                setEnrollments(data?.data?.enrollments ?? []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Filter logic ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = enrollments;

        if (tab === "inprogress") list = list.filter((e) => !e.completed_at);
        if (tab === "completed") list = list.filter((e) => !!e.completed_at);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (e) => e.title?.toLowerCase().includes(q) || e.category_name?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [enrollments, tab, search]);

    // ── Counts for tab badges ──────────────────────────────────────────────────
    const counts = useMemo(
        () => ({
            all: enrollments.length,
            inprogress: enrollments.filter((e) => !e.completed_at).length,
            completed: enrollments.filter((e) => !!e.completed_at).length,
        }),
        [enrollments]
    );

    return (
        <>
            <div
                className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="mb-6">
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#0F172A",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        My Courses
                    </h1>
                    <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
                        {enrollments.length > 0
                            ? `${enrollments.length} course${enrollments.length > 1 ? "s" : ""} enrolled`
                            : "You haven't enrolled in any course yet"}
                    </p>
                </div>

                {/* ── Tabs + Search row ────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    {/* Tabs */}
                    <div
                        className="flex items-center gap-1 p-1 rounded-xl shrink-0"
                        style={{ background: "#EEF2F7" }}
                    >
                        {TABS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all duration-200"
                                )}
                                style={{
                                    fontSize: "13px",
                                    fontWeight: tab === key ? 700 : 500,
                                    background: tab === key ? "#fff" : "transparent",
                                    color: tab === key ? "#0F172A" : "#64748B",
                                    boxShadow: tab === key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                                }}
                            >
                                {label}
                                <span
                                    className="px-1.5 py-0.5 rounded-md text-[11px] font-bold"
                                    style={{
                                        background: tab === key ? "#EBF4FF" : "rgba(0,0,0,0.06)",
                                        color: tab === key ? "#3282B8" : "#94A3B8",
                                    }}
                                >
                                    {counts[key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-[340px]">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses..."
                            style={{
                                width: "100%",
                                height: "38px",
                                paddingLeft: "36px",
                                paddingRight: "12px",
                                borderRadius: "10px",
                                border: "1px solid #E2E8F0",
                                background: "#fff",
                                fontSize: "13px",
                                color: "#0F172A",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                {loading ? (
                    <CoursesGridSkeleton />
                ) : error ? (
                    <ErrorState message={error} onRetry={() => window.location.reload()} />
                ) : filtered.length === 0 ? (
                    <EmptyState tab={tab} search={search} onBrowse={() => navigate("/courses")} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((enrollment) => (
                            <CourseCard
                                key={enrollment.id}
                                enrollment={enrollment}
                                onOpen={() => navigate(`/student/course/${enrollment.course_id}/learn`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ enrollment, onOpen }) {
    const isCompleted = !!enrollment.completed_at;
    const progress = enrollment.progress ?? 0;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{
                border: "1px solid #EEF2F7",
                boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
            }}
            onClick={onOpen}
        >
            {/* Thumbnail */}
            <div
                className="relative h-[150px] overflow-hidden"
                style={{
                    background: enrollment.thumbnail
                        ? undefined
                        : "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
                }}
            >
                {enrollment.thumbnail ? (
                    <img
                        src={enrollment.thumbnail}
                        alt={enrollment.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span
                            style={{
                                fontSize: "42px",
                                fontWeight: 900,
                                color: "rgba(255,255,255,0.12)",
                                letterSpacing: "-2px",
                            }}
                        >
                            {enrollment.title?.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                        <Play size={16} className="text-[#3282B8] fill-[#3282B8] ml-0.5" />
                    </div>
                </div>

                {/* Category badge */}
                {enrollment.category_name && (
                    <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-lg"
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            background: "rgba(50,130,184,0.85)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {enrollment.category_name}
                    </span>
                )}

                {/* Completed tick */}
                {isCompleted && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={14} className="text-white" />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Title */}
                <p
                    className="line-clamp-2"
                    style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", lineHeight: 1.45 }}
                >
                    {enrollment.title}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-3 flex-wrap">
                    {enrollment.level && <MetaChip label={enrollment.level} />}
                    {enrollment.total_lessons > 0 && (
                        <MetaChip icon={BookOpen} label={`${enrollment.total_lessons} lessons`} />
                    )}
                    {enrollment.total_duration > 0 && (
                        <MetaChip icon={Clock} label={fmtDuration(enrollment.total_duration)} />
                    )}
                </div>

                {/* Progress */}
                <div className="mt-auto space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span
                            style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#94A3B8",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            {isCompleted ? "Completed" : "Progress"}
                        </span>
                        <span
                            style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: isCompleted ? "#10B981" : "#3282B8",
                            }}
                        >
                            {progress}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                background: isCompleted
                                    ? "#10B981"
                                    : "linear-gradient(90deg, #3282B8, #60A5FA)",
                                transition: "width 0.6s ease",
                            }}
                        />
                    </div>
                </div>

                {/* Enrolled date */}
                <p style={{ fontSize: "11px", color: "#CBD5E1" }}>
                    Enrolled {fmtDate(enrollment.enrolled_at)}
                </p>
            </div>
        </div>
    );
}

function MetaChip({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-1" style={{ color: "#94A3B8" }}>
            {Icon && <Icon size={11} />}
            <span style={{ fontSize: "11.5px", fontWeight: 500, textTransform: "capitalize" }}>{label}</span>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab, search, onBrowse }) {
    const messages = {
        inprogress: { title: "No courses in progress", desc: "Start a course to see it here." },
        completed: { title: "No completed courses yet", desc: "Keep learning to earn completions!" },
        all: {
            title: "No courses found",
            desc: search ? "Try a different search term." : "Browse and enroll in a course to get started.",
        },
    };
    const { title, desc } = messages[tab] ?? messages.all;

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "#F1F5F9" }}
            >
                <BookOpen size={28} style={{ color: "#CBD5E1" }} />
            </div>
            <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
                    {title}
                </p>
                <p style={{ fontSize: "13.5px", color: "#94A3B8" }}>{desc}</p>
            </div>
            {!search && tab === "all" && (
                <button
                    onClick={onBrowse}
                    className="px-5 py-2.5 rounded-xl text-white"
                    style={{ background: "#3282B8", fontSize: "13px", fontWeight: 700 }}
                >
                    Browse Courses
                </button>
            )}
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#EF4444" }}>{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl"
                style={{ background: "#FEF2F2", color: "#EF4444", fontSize: "13px", fontWeight: 700 }}
            >
                Try Again
            </button>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CoursesGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
            {Array(8)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl overflow-hidden"
                        style={{ border: "1px solid #EEF2F7" }}
                    >
                        <div className="h-[150px] bg-[#F1F5F9]" />
                        <div className="p-4 space-y-3">
                            <div className="h-3.5 bg-[#F1F5F9] rounded-full w-full" />
                            <div className="h-3 bg-[#F1F5F9] rounded-full w-2/3" />
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full w-full mt-4" />
                        </div>
                    </div>
                ))}
        </div>
    );
}
