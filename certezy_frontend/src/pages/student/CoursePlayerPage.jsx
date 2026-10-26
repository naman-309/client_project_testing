import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Lock,
    BookOpen,
    Clock,
    FileText,
    Menu,
    X,
    AlertCircle,
    Award,
} from "lucide-react";

import sectionService from "@/services/sectionService";
import lessonService from "@/services/lessonService";
import progressService from "@/services/progressService";
import enrollmentService from "@/services/enrollmentService";
import testService from "@/services/testService";
import { cn } from "@/lib/utils";
import { EnhancedTextLesson } from "@/components/player/EnhancedTextLesson";
import BrandName from "@/components/shared/BrandName";

// ─── Constants ────────────────────────────────────────────────────────────────
const PROGRESS_SYNC_INTERVAL = 15; // seconds — har 15s mein progress save
const AUTO_COMPLETE_THRESHOLD = 0.9; // 90% dekha toh complete

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(seconds) {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // ── Data state ─────────────────────────────────────────────────────────────
    const [sections, setSections] = useState([]); // [{...section, lessons:[]}]
    const [progressMap, setProgressMap] = useState({}); // { lesson_id: { is_completed, watch_time } }
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [courseExams, setCourseExams] = useState([]); // Exams for this course
    const [examAttemptsMap, setExamAttemptsMap] = useState({});

    // ── UI state ───────────────────────────────────────────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});

    // ── Video / progress refs ──────────────────────────────────────────────────
    const videoRef = useRef(null);
    const watchTimeRef = useRef(0); // seconds watched this session
    const lastSyncRef = useRef(0); // last time we synced to backend
    const completedRef = useRef({}); // local completed set (avoid re-renders)

    // ─── Fetch all data ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                // 1. Check enrollment
                const enrRes = await enrollmentService.checkEnrollment(courseId);
                const enrolled = enrRes.data?.data?.enrolled ?? false;
                setIsEnrolled(enrolled);

                if (!enrolled) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch sections
                const secRes = await sectionService.getByCourseId(courseId);
                const rawSections = secRes.data?.data?.sections ?? [];

                // 3. Fetch lessons for ALL sections in parallel
                const sectionsWithLessons = await Promise.all(
                    rawSections.map(async (sec) => {
                        const lesRes = await lessonService.getBySectionId(sec.id);
                        return {
                            ...sec,
                            lessons: lesRes.data?.data?.lessons ?? [],
                        };
                    })
                );

                setSections(sectionsWithLessons);

                // 4. Expand first section by default
                if (sectionsWithLessons.length > 0) {
                    setExpandedSections({ [sectionsWithLessons[0].id]: true });
                }

                // 5. Fetch progress
                const progRes = await progressService.getCourseProgress(courseId);
                const progList = progRes.data?.data?.progress ?? [];
                const map = {};
                progList.forEach((p) => {
                    map[p.lesson_id] = p;
                });
                setProgressMap(map);
                completedRef.current = map;

                // 6. Fetch exams for this course & check previous attempts
                try {
                    const examRes = await testService.getByCourseId(courseId);
                    const tests = examRes.data?.data?.tests ?? [];
                    setCourseExams(tests);

                    try {
                        const attRes = await testService.getMyAttempts();
                        const myAttempts = attRes.data?.data?.attempts ?? [];
                        const attMap = {};
                        myAttempts.forEach((att) => {
                            if (!attMap[att.test_id] || att.score > attMap[att.test_id].score) {
                                attMap[att.test_id] = att;
                            }
                        });
                        setExamAttemptsMap(attMap);
                    } catch {
                        // silent
                    }
                } catch (examErr) {
                    console.warn("No exams found for this course:", examErr);
                    setCourseExams([]);
                }

                // 7. Set current lesson — first incomplete or first lesson
                const allLessons = sectionsWithLessons.flatMap((s) => s.lessons);
                if (allLessons.length > 0) {
                    const firstIncomplete = allLessons.find((l) => !map[l.id]?.is_completed);
                    const lesson = firstIncomplete ?? allLessons[0];
                    const fullLesson = await lessonService.getById(lesson.id);
                    setCurrentLesson(fullLesson.data?.data?.lesson ?? lesson);

                    // Expand that lesson's section
                    setExpandedSections((prev) => ({
                        ...prev,
                        [lesson.section_id]: true,
                    }));
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load course");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [courseId]);

    // ── Open a lesson ──────────────────────────────────────────────────────────
    const openLesson = useCallback(async (lesson) => {
        // Save current video progress before switching
        await syncProgress(false);

        // Reset watch time
        watchTimeRef.current = 0;
        lastSyncRef.current = 0;

        // Fetch full lesson (with content/video URL)
        try {
            const res = await lessonService.getById(lesson.id);
            setCurrentLesson(res.data?.data?.lesson ?? lesson);
        } catch {
            setCurrentLesson(lesson);
        }
    }, []);

    // ── Progress sync ──────────────────────────────────────────────────────────
    const syncProgress = useCallback(
        async (markComplete = false) => {
            if (!currentLesson) return;

            const is_completed = markComplete || !!completedRef.current[currentLesson.id]?.is_completed;

            try {
                await progressService.updateLessonProgress({
                    lesson_id: currentLesson.id,
                    is_completed: is_completed ? 1 : 0,
                    watch_time: Math.floor(watchTimeRef.current),
                });

                if (is_completed) {
                    completedRef.current = {
                        ...completedRef.current,
                        [currentLesson.id]: { is_completed: 1 },
                    };
                    setProgressMap((prev) => ({
                        ...prev,
                        [currentLesson.id]: { ...prev[currentLesson.id], is_completed: 1 },
                    }));
                }
            } catch (err) {
                console.error("Progress sync failed:", err);
            }
        },
        [currentLesson]
    );

    // ── Video event handlers ───────────────────────────────────────────────────
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        watchTimeRef.current = video.currentTime;

        // Auto-complete at 90%
        const ratio = video.currentTime / video.duration;
        if (ratio >= AUTO_COMPLETE_THRESHOLD && !completedRef.current[currentLesson?.id]?.is_completed) {
            syncProgress(true);
        }

        // Periodic sync every N seconds
        if (video.currentTime - lastSyncRef.current >= PROGRESS_SYNC_INTERVAL) {
            lastSyncRef.current = video.currentTime;
            syncProgress(false);
        }
    }, [currentLesson, syncProgress]);

    const handleVideoEnded = useCallback(() => {
        syncProgress(true);
        // Auto-advance to next lesson
        goToNextLesson();
    }, [syncProgress]);

    // ── Next / Prev lesson ─────────────────────────────────────────────────────
    const allLessons = sections.flatMap((s) => s.lessons);
    const currentIdx = allLessons.findIndex((l) => l.id === currentLesson?.id);

    const goToNextLesson = useCallback(async () => {
        if (currentIdx < allLessons.length - 1) {
            await openLesson(allLessons[currentIdx + 1]);
        }
    }, [currentIdx, allLessons, openLesson]);

    const goToPrevLesson = useCallback(async () => {
        if (currentIdx > 0) {
            await openLesson(allLessons[currentIdx - 1]);
        }
    }, [currentIdx, allLessons, openLesson]);

    // ── Manual complete ────────────────────────────────────────────────────────
    const markLessonComplete = () => syncProgress(true);

    // ── Cleanup on unmount ─────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            syncProgress(false);
        };
    }, [syncProgress]);

    // ─── Guards ────────────────────────────────────────────────────────────────
    if (loading) return <PlayerSkeleton />;

    if (!isEnrolled) return <NotEnrolledState courseId={courseId} navigate={navigate} />;

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
                <div className="text-center px-6">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-3">{error}</p>
                    <button
                        onClick={() => navigate("/student/my-courses")}
                        className="px-4 py-2 rounded-xl bg-[#3282B8] text-white text-sm font-bold"
                    >
                        ← My Courses
                    </button>
                </div>
            </div>
        );

    // ── Total + completed count ────────────────────────────────────────────────
    const totalLessons = allLessons.length;
    const completedLessons = Object.values(progressMap).filter((p) => p.is_completed).length;
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#0F172A" }}
        >
            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <TopBar
                courseId={courseId}
                navigate={navigate}
                progressPct={progressPct}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((p) => !p)}
            />

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* ── Video + controls ────────────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-[#0F172A]">
                    {currentLesson ? (
                        <>
                            {/* Video area */}
                            <div
                                className="w-full bg-black"
                                style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" }}
                            >
                                {currentLesson.type === "video" && currentLesson.content ? (
                                    <video
                                        ref={videoRef}
                                        key={currentLesson.id}
                                        src={currentLesson.content}
                                        controls
                                        className="w-full h-full"
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleVideoEnded}
                                        style={{ outline: "none" }}
                                    />
                                ) : (
                                    // Text / article lesson content area
                                    <div className="w-full h-full bg-[#0a1628] overflow-y-auto">
                                        {currentLesson.content ? (
                                            <div className="p-6">
                                                <EnhancedTextLesson
                                                    lesson={currentLesson}
                                                    onMarkComplete={markLessonComplete}
                                                    isCompleted={
                                                        !!progressMap[currentLesson.id]?.is_completed
                                                    }
                                                    onPrevious={goToPrevLesson}
                                                    onNext={goToNextLesson}
                                                    hasNext={currentIdx < allLessons.length - 1}
                                                    hasPrevious={currentIdx > 0}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <FileText
                                                        size={48}
                                                        style={{ color: "rgba(255,255,255,0.2)" }}
                                                        className="mx-auto mb-3"
                                                    />
                                                    <p
                                                        style={{
                                                            color: "rgba(255,255,255,0.4)",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        No content available
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Lesson info + nav */}
                            <div className="px-5 py-5 max-w-4xl w-full mx-auto">
                                {/* Title row */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                color: "#3282B8",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.08em",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            Lesson {currentIdx + 1} of {totalLessons}
                                        </p>
                                        <h1
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 800,
                                                color: "#fff",
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {currentLesson.title}
                                        </h1>
                                    </div>

                                    {/* Mark complete */}
                                    {!progressMap[currentLesson.id]?.is_completed ? (
                                        <button
                                            onClick={markLessonComplete}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
                                            style={{
                                                background: "#3282B8",
                                                color: "#fff",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            <CheckCircle2 size={15} />
                                            Mark Complete
                                        </button>
                                    ) : (
                                        <div
                                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                            style={{
                                                background: "rgba(16,185,129,0.15)",
                                                color: "#10B981",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            <CheckCircle2 size={15} />
                                            Completed
                                        </div>
                                    )}
                                </div>

                                {/* Duration */}
                                {currentLesson.duration > 0 && (
                                    <div className="flex items-center gap-1.5 mb-5">
                                        <Clock size={13} style={{ color: "#64748B" }} />
                                        <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                                            {fmtDuration(currentLesson.duration)}
                                        </span>
                                    </div>
                                )}

                                {/* Prev / Next buttons - Only for video lessons */}
                                {currentLesson.type === "video" && (
                                    <div
                                        className="flex items-center justify-between pt-4"
                                        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        <button
                                            onClick={goToPrevLesson}
                                            disabled={currentIdx === 0}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all disabled:opacity-30"
                                            style={{
                                                background: "rgba(255,255,255,0.06)",
                                                color: "#fff",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                            }}
                                        >
                                            <ChevronLeft size={16} />
                                            Previous
                                        </button>

                                        <button
                                            onClick={goToNextLesson}
                                            disabled={currentIdx === allLessons.length - 1}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all disabled:opacity-30"
                                            style={{
                                                background: "#3282B8",
                                                color: "#fff",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            Next Lesson
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <BookOpen
                                    size={48}
                                    style={{ color: "rgba(255,255,255,0.15)" }}
                                    className="mx-auto mb-4"
                                />
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
                                    No lessons available
                                </p>
                            </div>
                        </div>
                    )}
                </main>

                {/* ── Sidebar ─────────────────────────────────────────────── */}
                {sidebarOpen && (
                    <CourseSidebar
                        sections={sections}
                        currentLesson={currentLesson}
                        progressMap={progressMap}
                        expandedSections={expandedSections}
                        onToggleSection={(id) =>
                            setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
                        }
                        onSelectLesson={openLesson}
                        courseExams={courseExams}
                        examAttemptsMap={examAttemptsMap}
                        courseId={courseId}
                        navigate={navigate}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ navigate, progressPct, completedLessons, totalLessons, sidebarOpen, onToggleSidebar }) {
    return (
        <div
            className="h-[60px] flex items-center px-4 gap-4 shrink-0"
            style={{
                background: "#0a1628",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Back */}
            <button
                onClick={() => navigate("/student/my-courses")}
                className="flex items-center gap-1.5 shrink-0"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", fontWeight: 600 }}
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:block">My Courses</span>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#3282B8] flex items-center justify-center">
                    <svg
                        width="13"
                        height="13"
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
                    className="hidden sm:block"
                    style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}
                >
                    <BrandName accentColor="#3282B8" />
                </span>
            </Link>

            {/* Progress bar — center */}
            <div className="flex-1 flex items-center gap-3 max-w-sm mx-auto">
                <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPct}%`,
                            background: "linear-gradient(90deg, #3282B8, #60A5FA)",
                        }}
                    />
                </div>
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.55)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {completedLessons}/{totalLessons}
                </span>
            </div>

            {/* Sidebar toggle */}
            <button
                onClick={onToggleSidebar}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                style={{
                    background: sidebarOpen ? "rgba(50,130,184,0.2)" : "rgba(255,255,255,0.06)",
                    color: sidebarOpen ? "#3282B8" : "rgba(255,255,255,0.55)",
                    fontSize: "12px",
                    fontWeight: 600,
                }}
            >
                {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
                <span className="hidden sm:block">Course Content</span>
            </button>
        </div>
    );
}

// ─── Course Sidebar ───────────────────────────────────────────────────────────
function CourseSidebar({
    sections,
    currentLesson,
    progressMap,
    expandedSections,
    onToggleSection,
    onSelectLesson,
    courseExams,
    examAttemptsMap = {},
    courseId,
    navigate,
}) {
    return (
        <aside
            className="w-[300px] xl:w-[320px] shrink-0 flex flex-col overflow-hidden"
            style={{
                background: "#0a1628",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Course Content</p>
                <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                    {sections.length} sections • {sections.reduce((a, s) => a + s.lessons.length, 0)} lessons
                </p>
            </div>

            {/* Sections list */}
            <div className="flex-1 overflow-y-auto">
                {sections.map((section, sIdx) => {
                    const isExpanded = !!expandedSections[section.id];
                    const secCompleted = section.lessons.filter(
                        (l) => progressMap[l.id]?.is_completed
                    ).length;

                    return (
                        <div key={section.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {/* Section header */}
                            <button
                                onClick={() => onToggleSection(section.id)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/5 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "#fff",
                                            lineHeight: 1.4,
                                        }}
                                        className="truncate"
                                    >
                                        Section {sIdx + 1}: {section.title}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: "rgba(255,255,255,0.35)",
                                            marginTop: "2px",
                                        }}
                                    >
                                        {secCompleted}/{section.lessons.length} completed
                                    </p>
                                </div>
                                <ChevronDown
                                    size={15}
                                    style={{
                                        color: "rgba(255,255,255,0.4)",
                                        transform: isExpanded ? "rotate(180deg)" : "none",
                                        transition: "transform 0.2s",
                                        flexShrink: 0,
                                        marginLeft: "8px",
                                    }}
                                />
                            </button>

                            {/* Lessons */}
                            {isExpanded && (
                                <div>
                                    {section.lessons.map((lesson) => {
                                        const isActive = currentLesson?.id === lesson.id;
                                        const isCompleted = !!progressMap[lesson.id]?.is_completed;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-5 py-3 text-left transition-colors",
                                                    isActive ? "bg-[#3282B8]/20" : "hover:bg-white/5"
                                                )}
                                            >
                                                {/* Status icon */}
                                                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                                                    {isCompleted ? (
                                                        <CheckCircle2
                                                            size={16}
                                                            style={{ color: "#10B981" }}
                                                        />
                                                    ) : isActive ? (
                                                        <PlayCircle size={16} style={{ color: "#3282B8" }} />
                                                    ) : (
                                                        <div
                                                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                                            style={{ borderColor: "rgba(255,255,255,0.2)" }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Title + duration */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="truncate"
                                                        style={{
                                                            fontSize: "12.5px",
                                                            fontWeight: isActive ? 700 : 500,
                                                            color: isActive
                                                                ? "#fff"
                                                                : isCompleted
                                                                  ? "rgba(255,255,255,0.5)"
                                                                  : "rgba(255,255,255,0.7)",
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {lesson.type === "video" ? (
                                                            <PlayCircle
                                                                size={10}
                                                                style={{ color: "rgba(255,255,255,0.3)" }}
                                                            />
                                                        ) : (
                                                            <FileText
                                                                size={10}
                                                                style={{ color: "rgba(255,255,255,0.3)" }}
                                                            />
                                                        )}
                                                        {lesson.duration > 0 && (
                                                            <span
                                                                style={{
                                                                    fontSize: "11px",
                                                                    color: "rgba(255,255,255,0.3)",
                                                                }}
                                                            >
                                                                {fmtDuration(lesson.duration)}
                                                            </span>
                                                        )}
                                                        {lesson.is_free === 1 && (
                                                            <span
                                                                style={{
                                                                    fontSize: "9px",
                                                                    fontWeight: 700,
                                                                    color: "#10B981",
                                                                    background: "rgba(16,185,129,0.15)",
                                                                    padding: "1px 5px",
                                                                    borderRadius: "4px",
                                                                }}
                                                            >
                                                                FREE
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Exams Section */}
            {courseExams.length > 0 && (
                <div className="border-t border-gray-200">
                    <div className="px-5 py-4">
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Course Exams</p>
                        <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                            {courseExams.length} exam{courseExams.length > 1 ? "s" : ""} available
                        </p>
                    </div>
                    <div className="px-2 pb-4">
                        {courseExams.map((exam) => {
                            const att = (examAttemptsMap || {})[exam.id];
                            return (
                                <button
                                    key={exam.id}
                                    onClick={() => navigate(`/student/course/${courseId}/exam/${exam.id}`)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5 text-left"
                                >
                                    <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                                        {att?.is_passed ? (
                                            <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                                        ) : att ? (
                                            <Award size={16} style={{ color: "#F59E0B" }} />
                                        ) : (
                                            <Award size={16} style={{ color: "#3282B8" }} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="truncate"
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                color: "rgba(255,255,255,0.8)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {exam.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {att ? (
                                                <span
                                                    style={{
                                                        fontSize: "10px",
                                                        fontWeight: 700,
                                                        padding: "1px 6px",
                                                        borderRadius: "4px",
                                                        background: att.is_passed
                                                            ? "rgba(16, 185, 129, 0.2)"
                                                            : "rgba(239, 68, 68, 0.2)",
                                                        color: att.is_passed ? "#10B981" : "#EF4444",
                                                    }}
                                                >
                                                    {att.is_passed
                                                        ? `Passed (${Math.round(att.score)}%)`
                                                        : `Attempted (${Math.round(att.score)}%)`}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                                                    {exam.duration_minutes || exam.duration || 30} min · {exam.total_questions || exam.questions_count || 0} questions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </aside>
    );
}

// ─── Not Enrolled ─────────────────────────────────────────────────────────────
function NotEnrolledState({ navigate }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
            <div className="text-center px-6">
                <Lock size={48} style={{ color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-4" />
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
                    You're not enrolled
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>
                    Enroll in this course to access the lessons.
                </p>
                <div className="flex items-center gap-3 justify-center">
                    <button
                        onClick={() => navigate("/courses")}
                        className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                        style={{ background: "#3282B8" }}
                    >
                        View Course
                    </button>
                    <button
                        onClick={() => navigate("/student/my-courses")}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                    >
                        My Courses
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PlayerSkeleton() {
    return (
        <div className="h-screen flex flex-col bg-[#0F172A] animate-pulse">
            <div
                className="h-[60px] bg-[#0a1628]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 bg-black" style={{ aspectRatio: "16/9" }} />
                <div
                    className="w-[300px] bg-[#0a1628]"
                    style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <div className="p-5 space-y-4">
                        {Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 rounded-xl"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
