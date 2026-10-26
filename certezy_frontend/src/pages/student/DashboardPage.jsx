import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BookOpen,
    CheckCircle2,
    Award,
    ClipboardList,
    ChevronRight,
    Download,
    TrendingUp,
    Play,
} from "lucide-react";

import { selectUser } from "@/features/auth/authSlice";
import enrollmentService from "@/services/enrollmentService";
import certificateService from "@/services/certificateService";
import attemptService from "@/services/attemptService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const user = useSelector(selectUser);

    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [enrRes, certRes, attemptRes] = await Promise.all([
                    enrollmentService.getMyEnrollments(),
                    certificateService.getMyCertificates(),
                    attemptService.getMyAttempts().catch(() => ({ data: { data: { attempts: [] } } })),
                ]);

                const enrList = enrRes.data?.data?.enrollments ?? [];
                const certList = certRes.data?.data?.certificates ?? [];
                const attList = attemptRes.data?.data?.attempts ?? [];

                setEnrollments(enrList);
                setCertificates(certList);
                setRecentAttempts(attList);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();

        // Listen for enrollment updates (e.g., after payment)
        const handleEnrollmentUpdate = () => fetchAll();
        window.addEventListener("enrollment-updated", handleEnrollmentUpdate);

        return () => {
            window.removeEventListener("enrollment-updated", handleEnrollmentUpdate);
        };
    }, []);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter((e) => e.completed_at).length;
    const inProgress = enrollments
        .filter((e) => !e.completed_at && (e.progress ?? 0) > 0)
        .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
        .slice(0, 3);

    const totalCerts = certificates.length;

    const firstName = user?.name?.split(" ")[0] ?? "Student";

    if (loading)
        return (
            <>
                <DashboardSkeleton />
            </>
        );

    return (
        <>
            <div
                className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Welcome Banner ────────────────────────────────────────── */}
                <WelcomeBanner firstName={firstName} totalEnrolled={totalEnrolled} />

                {/* ── Stats row ─────────────────────────────────────────────── */}
                <StatsRow
                    totalEnrolled={totalEnrolled}
                    totalCompleted={totalCompleted}
                    totalCerts={totalCerts}
                    recentAttemptsCount={recentAttempts.length}
                />

                {/* ── Continue Learning ─────────────────────────────────────── */}
                <ContinueLearning enrollments={enrollments} inProgress={inProgress} />

                {/* ── Bottom 2-col grid: Tests + Certificates ───────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <RecentTests attempts={recentAttempts} enrollments={enrollments} />
                    <CertificatesSection certificates={certificates} />
                </div>
            </div>
        </>
    );
}

// ─── Welcome Banner ───────────────────────────────────────────────────────────

function WelcomeBanner({ firstName, totalEnrolled }) {
    return (
        <div
            className="rounded-2xl px-6 py-7 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
            }}
        >
            {/* dot pattern */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.04,
                    backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    pointerEvents: "none",
                }}
            />

            {/* glow */}
            <div
                style={{
                    position: "absolute",
                    top: "-40px",
                    right: "80px",
                    width: "200px",
                    height: "200px",
                    background: "radial-gradient(circle, rgba(50,130,184,0.25), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1
                        style={{
                            fontSize: "clamp(20px, 2.5vw, 26px)",
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: "-0.02em",
                            marginBottom: "6px",
                        }}
                    >
                        Welcome back, {firstName} 👋
                    </h1>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.58)", lineHeight: 1.6 }}>
                        {totalEnrolled > 0
                            ? `You have ${totalEnrolled} course${totalEnrolled > 1 ? "s" : ""} in progress. Keep pushing forward!`
                            : "Start your learning journey — browse courses and enroll today."}
                    </p>

                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg no-underline transition-colors duration-200"
                        style={{
                            background: "#3282B8",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: 700,
                        }}
                    >
                        Browse Courses
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Right badge */}
                <div
                    className="hidden sm:flex items-center gap-3 px-5 py-4 rounded-2xl shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(50,130,184,0.25)" }}
                    >
                        <TrendingUp size={20} style={{ color: "#60A5FA" }} />
                    </div>
                    <div>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.4)",
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                            }}
                        >
                            Learning Streak
                        </p>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Keep it up!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ totalEnrolled, totalCompleted, totalCerts, recentAttemptsCount }) {
    const stats = [
        {
            label: "Enrolled Courses",
            value: totalEnrolled,
            icon: BookOpen,
            color: "#3282B8",
            bg: "#EBF4FF",
        },
        {
            label: "Completed",
            value: totalCompleted,
            icon: CheckCircle2,
            color: "#10B981",
            bg: "#ECFDF5",
        },
        {
            label: "Certificates",
            value: totalCerts,
            icon: Award,
            color: "#F59E0B",
            bg: "#FFFBEB",
        },
        {
            label: "Tests Attempted",
            value: recentAttemptsCount,
            icon: ClipboardList,
            color: "#8B5CF6",
            bg: "#F5F3FF",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                    key={label}
                    className="bg-white rounded-2xl p-5 flex items-center gap-4"
                    style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                >
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: bg }}
                    >
                        <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                        <p style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
                            {value}
                        </p>
                        <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px", fontWeight: 500 }}>
                            {label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Continue Learning ────────────────────────────────────────────────────────

function ContinueLearning({ enrollments, inProgress }) {
    const navigate = useNavigate();

    // Agar koi in-progress nahi toh latest enrolled dikhao
    const displayList = inProgress.length > 0 ? inProgress : enrollments.slice(0, 3);

    if (enrollments.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>Continue Learning</h2>
                <Link
                    to="/student/my-courses"
                    className="flex items-center gap-1 no-underline"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#3282B8" }}
                >
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayList.map((enrollment) => (
                    <CourseProgressCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        onContinue={() => navigate(`/student/course/${enrollment.course_id}/learn`)}
                    />
                ))}
            </div>
        </section>
    );
}

function CourseProgressCard({ enrollment, onContinue }) {
    const progress = enrollment.progress ?? 0;
    const isCompleted = !!enrollment.completed_at;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Thumbnail */}
            <div
                className="h-[140px] flex items-center justify-center relative"
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
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span
                        style={{
                            fontSize: "36px",
                            fontWeight: 900,
                            color: "rgba(255,255,255,0.15)",
                            letterSpacing: "-2px",
                        }}
                    >
                        {enrollment.title?.slice(0, 2).toUpperCase()}
                    </span>
                )}

                {/* Category badge */}
                {enrollment.category_name && (
                    <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-white"
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            background: "rgba(50,130,184,0.85)",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {enrollment.category_name}
                    </span>
                )}

                {/* Completed badge */}
                {isCompleted && (
                    <span
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg"
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "rgba(16,185,129,0.85)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        ✓ Done
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <p
                    style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: 1.4,
                        marginBottom: "12px",
                    }}
                    className="line-clamp-2"
                >
                    {enrollment.title}
                </p>

                {/* Progress bar */}
                <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between">
                        <span
                            style={{
                                fontSize: "11px",
                                color: "#94A3B8",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Progress
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#3282B8" }}>
                            {progress}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: isCompleted
                                    ? "#10B981"
                                    : "linear-gradient(90deg, #3282B8, #60A5FA)",
                            }}
                        />
                    </div>

                    <button
                        onClick={onContinue}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white transition-colors duration-200"
                        style={{
                            background: isCompleted ? "#10B981" : "#3282B8",
                            fontSize: "13px",
                            fontWeight: 700,
                        }}
                    >
                        <Play size={13} className="fill-white" />
                        {isCompleted ? "Review" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Recent Tests ─────────────────────────────────────────────────────────────

function RecentTests({ attempts, enrollments }) {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white rounded-2xl p-6"
            style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-[3px] h-5 rounded-full bg-[#3282B8] shrink-0" />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>Recent Tests</h2>
                </div>
                <Link
                    to="/student/tests"
                    className="no-underline"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#3282B8" }}
                >
                    View All
                </Link>
            </div>

            {attempts.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No tests attempted yet"
                    desc="Take a test from any of your enrolled courses."
                    actionLabel={enrollments.length > 0 ? "Go to My Courses" : "Browse Courses"}
                    onAction={() => navigate(enrollments.length > 0 ? "/student/my-courses" : "/courses")}
                />
            ) : (
                <div className="space-y-1">
                    {/* Table header */}
                    <div
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 pb-2"
                        style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                        {["Test Name", "Score", "Status", "Action"].map((h) => (
                            <span
                                key={h}
                                style={{
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    color: "#94A3B8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                {h}
                            </span>
                        ))}
                    </div>

                    {attempts.slice(0, 5).map((attempt) => (
                        <div
                            key={attempt.id}
                            className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                        >
                            <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                                    {attempt.test_title ?? "Test"}
                                </p>
                                <p style={{ fontSize: "11px", color: "#94A3B8" }}>
                                    {fmtDate(attempt.completed_at)}
                                </p>
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                                {attempt.score}%
                            </span>
                            <span
                                className="px-2.5 py-1 rounded-lg text-center"
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    background: attempt.is_passed ? "#ECFDF5" : "#FEF2F2",
                                    color: attempt.is_passed ? "#10B981" : "#EF4444",
                                }}
                            >
                                {attempt.is_passed ? "Passed" : "Failed"}
                            </span>
                            <Link
                                to={`/student/tests/${attempt.id}/result`}
                                className="no-underline"
                                style={{ fontSize: "12px", fontWeight: 600, color: "#3282B8" }}
                            >
                                Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Certificates ─────────────────────────────────────────────────────────────

function CertificatesSection({ certificates }) {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white rounded-2xl p-6"
            style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-[3px] h-5 rounded-full bg-[#3282B8] shrink-0" />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>My Certificates</h2>
                </div>
                {certificates.length > 0 && (
                    <Link
                        to="/student/certificates"
                        className="no-underline"
                        style={{ fontSize: "13px", fontWeight: 600, color: "#3282B8" }}
                    >
                        View All
                    </Link>
                )}
            </div>

            {certificates.length === 0 ? (
                <EmptyState
                    icon={Award}
                    title="No certificates yet"
                    desc="Complete a course to earn your certificate."
                    actionLabel="Browse Courses"
                    onAction={() => navigate("/courses")}
                />
            ) : (
                <div className="space-y-3">
                    {certificates.slice(0, 3).map((cert) => (
                        <CertCard key={cert.id} cert={cert} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CertCard({ cert }) {
    return (
        <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#FEF3C7" }}
            >
                <Award size={20} style={{ color: "#F59E0B" }} />
            </div>

            <div className="flex-1 min-w-0">
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }} className="truncate">
                    {cert.course_title}
                </p>
                <p style={{ fontSize: "11px", color: "#92400E", marginTop: "2px" }}>
                    Issued {fmtDate(cert.issued_at)}
                </p>
            </div>

            {cert.pdf_url && (
                <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 shrink-0 no-underline px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                        background: "#FDE68A",
                        color: "#92400E",
                        fontSize: "12px",
                        fontWeight: 700,
                    }}
                >
                    <Download size={13} />
                    PDF
                </a>
            )}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, desc, actionLabel, onAction }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#F1F5F9" }}
            >
                <Icon size={24} style={{ color: "#94A3B8" }} />
            </div>
            <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                    {title}
                </p>
                <p style={{ fontSize: "13px", color: "#94A3B8" }}>{desc}</p>
            </div>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="mt-1 px-4 py-2 rounded-xl text-white transition-colors"
                    style={{ background: "#3282B8", fontSize: "13px", fontWeight: 700 }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
            {/* Banner */}
            <div
                className="h-[130px] rounded-2xl"
                style={{ background: "linear-gradient(135deg, #0a1628, #162d5a)" }}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl h-[84px]"
                            style={{ border: "1px solid #EEF2F7" }}
                        />
                    ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array(3)
                    .fill(0)
                    .map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl h-[280px]"
                            style={{ border: "1px solid #EEF2F7" }}
                        />
                    ))}
            </div>

            {/* Bottom */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Array(2)
                    .fill(0)
                    .map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl h-[300px]"
                            style={{ border: "1px solid #EEF2F7" }}
                        />
                    ))}
            </div>
        </div>
    );
}
