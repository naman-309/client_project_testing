import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Star, Users, BookOpen, Award, ChevronRight, CheckCircle, GraduationCap } from "lucide-react";

import courseService from "@/services/courseService";
import sectionService from "@/services/sectionService";
import enrollmentService from "@/services/enrollmentService";
import { selectIsLoggedIn } from "@/features/auth/authSlice";

import CourseCurriculum from "./CourseCurriculum";
import CourseEnrollCard from "./CourseEnrollCard";
import ReviewList from "@/components/student/ReviewList";
import ReviewStats from "@/components/student/ReviewStats";
import ReviewForm from "@/components/student/ReviewForm";
import { cn } from "@/lib/utils";

export default function CourseDetailIndex() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: cd } = await courseService.getBySlug(slug);
                const c = cd?.data?.course;
                setCourse(c);
                const { data: sd } = await sectionService.getByCourseId(c.id);
                setSections(sd?.data?.sections || []);
            } catch (err) {
                setError(err.response?.data?.message || "Course not found");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    useEffect(() => {
        if (!isLoggedIn || !course?.id) return;
        enrollmentService
            .checkEnrollment(course.id)
            .then(({ data }) => setIsEnrolled(data?.data?.enrolled ?? false))
            .catch(() => {});
    }, [isLoggedIn, course?.id]);

    const handleEnroll = () => {
        sessionStorage.setItem(`course_${course.id}`, JSON.stringify(course));
        if (!isLoggedIn) {
            navigate(`/login?redirect=${encodeURIComponent(`/checkout?course=${course.id}`)}`);
            return;
        }
        navigate(`/checkout?course=${course.id}`);
    };

    if (loading) return <CourseDetailSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
                <div className="text-center px-4">
                    <p className="text-[16px] font-semibold text-text-primary mb-3">{error}</p>
                    <button
                        onClick={() => navigate("/courses")}
                        className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                        ← Back to courses
                    </button>
                </div>
            </div>
        );
    }

    const whatYouLearn = course.what_you_learn ? course.what_you_learn.split("\n").filter(Boolean) : [];

    return (
        <div className="min-h-screen bg-[#F1F5F9]">
            {/* ── Hero ──────────────────────────────────────── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.04,
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "26px 26px",
                        pointerEvents: "none",
                    }}
                />

                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 lg:py-16 relative">
                    <div className="lg:max-w-[calc(100%-360px)]">
                        {/* Breadcrumb */}
                        <div
                            className="flex items-center gap-1.5 mb-5 flex-wrap"
                            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
                        >
                            <span
                                className="hover:text-white cursor-pointer transition-colors"
                                onClick={() => navigate("/courses")}
                            >
                                Courses
                            </span>
                            <ChevronRight size={11} />
                            <span
                                className="hover:text-white cursor-pointer transition-colors"
                                onClick={() => navigate(`/courses?category_id=${course.category_id}`)}
                            >
                                {course.category_name}
                            </span>
                            <ChevronRight size={11} />
                            <span
                                className="truncate max-w-[200px] sm:max-w-[400px]"
                                style={{ color: "rgba(255,255,255,0.6)" }}
                            >
                                {course.title}
                            </span>
                        </div>

                        {/* Category badge */}
                        <span
                            className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider mb-4 px-3 py-1.5 rounded-full"
                            style={{
                                background: "rgba(255,255,255,0.10)",
                                color: "#60A5FA",
                                border: "1px solid rgba(255,255,255,0.10)",
                            }}
                        >
                            {course.category_name}
                        </span>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: "clamp(22px, 3vw, 32px)",
                                fontWeight: 800,
                                color: "#fff",
                                lineHeight: 1.22,
                                letterSpacing: "-0.02em",
                                marginBottom: "14px",
                            }}
                        >
                            {course.title}
                        </h1>

                        {/* Short desc */}
                        {course.short_desc && (
                            <p
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 400,
                                    color: "rgba(255,255,255,0.62)",
                                    lineHeight: 1.65,
                                    marginBottom: "22px",
                                    maxWidth: "600px",
                                }}
                            >
                                {course.short_desc}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5">
                                    {Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={cn(
                                                    i < Math.round(course.rating_avg || 0)
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "fill-white/20 text-white/20"
                                                )}
                                            />
                                        ))}
                                </div>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                                    {course.rating_avg > 0 ? Number(course.rating_avg).toFixed(1) : "New"}
                                </span>
                                {course.rating_count > 0 && (
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)" }}>
                                        ({course.rating_count.toLocaleString()})
                                    </span>
                                )}
                            </div>
                            {course.enrolled_count > 0 && (
                                <StatPill
                                    icon={Users}
                                    label={`${course.enrolled_count.toLocaleString()} students`}
                                />
                            )}
                            {sections.length > 0 && (
                                <StatPill icon={BookOpen} label={`${sections.length} sections`} />
                            )}
                            {course.certificate_eligible === 1 && (
                                <StatPill icon={Award} label="Certificate" />
                            )}
                        </div>

                        {/* Instructor — hero mein sirf naam */}
                        {course.instructor_name && (
                            <div className="flex items-center gap-2.5 mt-5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                    style={{ background: "rgba(255,255,255,0.12)" }}
                                >
                                    {course.instructor_name.charAt(0).toUpperCase()}
                                </div>
                                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                                    Instructor:{" "}
                                    <span style={{ color: "#fff", fontWeight: 600 }}>
                                        {course.instructor_name}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────── */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* ── LEFT ── */}
                    <div className="w-full lg:flex-1 lg:min-w-0 space-y-5">
                        {/* What you'll learn */}
                        {whatYouLearn.length > 0 && (
                            <ContentCard title="What You'll Learn">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {whatYouLearn.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <CheckCircle size={15} className="text-primary shrink-0 mt-0.5" />
                                            <span
                                                style={{
                                                    fontSize: "13.5px",
                                                    color: "#475569",
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ContentCard>
                        )}

                        {/* About */}
                        {course.description && (
                            <ContentCard title="About this Course">
                                <p
                                    style={{
                                        fontSize: "14px",
                                        color: "#475569",
                                        lineHeight: 1.75,
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {course.description}
                                </p>
                            </ContentCard>
                        )}

                        {/* Curriculum */}
                        <ContentCard title="Curriculum">
                            <div className="flex items-center gap-2 mb-5 flex-wrap">
                                <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                                    {sections.length} sections
                                </span>
                                {course.total_lessons > 0 && (
                                    <>
                                        <span style={{ color: "#E2E8F0" }}>•</span>
                                        <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                                            {course.total_lessons} lessons
                                        </span>
                                    </>
                                )}
                            </div>
                            <CourseCurriculum
                                sections={sections}
                                courseId={course.id}
                                isEnrolled={isEnrolled}
                            />
                        </ContentCard>

                        {/* ── Instructor Section ─────────────────────
                            Backend se jo fields aate hain unhi se banaya:
                            instructor_name — hamesha hota hai
                            instructor_bio  — optional, agar nahi aata toh section nahi dikhega
                            instructor_avatar — optional, nahi toh initials
                            instructor_rating, instructor_students, instructor_courses — optional stats
                        ── */}
                        {course.instructor_name && (
                            <ContentCard title="Your Instructor">
                                <div className="flex items-start gap-4">
                                    {/* Avatar — photo ya initials */}
                                    {course.instructor_avatar ? (
                                        <img
                                            src={course.instructor_avatar}
                                            alt={course.instructor_name}
                                            className="w-16 h-16 rounded-2xl object-cover shrink-0"
                                            style={{ border: "2px solid #EEF2F7" }}
                                        />
                                    ) : (
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-[18px]"
                                            style={{
                                                background: "linear-gradient(135deg, #3282B8, #0a1628)",
                                            }}
                                        >
                                            {course.instructor_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {/* Name */}
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 700,
                                                color: "#0F172A",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {course.instructor_name}
                                        </p>

                                        {/* Role / title — agar backend se aaye */}
                                        {course.instructor_title && (
                                            <p
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#3282B8",
                                                    fontWeight: 500,
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                {course.instructor_title}
                                            </p>
                                        )}

                                        {/* Stats row — sirf jo available hain */}
                                        {(course.instructor_rating ||
                                            course.instructor_students ||
                                            course.instructor_courses) && (
                                            <div className="flex items-center gap-4 flex-wrap mb-3">
                                                {course.instructor_rating && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Star
                                                            size={13}
                                                            className="text-amber-400 fill-amber-400"
                                                        />
                                                        <span
                                                            style={{
                                                                fontSize: "12.5px",
                                                                fontWeight: 600,
                                                                color: "#0F172A",
                                                            }}
                                                        >
                                                            {course.instructor_rating} Rating
                                                        </span>
                                                    </div>
                                                )}
                                                {course.instructor_students && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={13} style={{ color: "#3282B8" }} />
                                                        <span
                                                            style={{
                                                                fontSize: "12.5px",
                                                                fontWeight: 600,
                                                                color: "#0F172A",
                                                            }}
                                                        >
                                                            {course.instructor_students.toLocaleString()}{" "}
                                                            Students
                                                        </span>
                                                    </div>
                                                )}
                                                {course.instructor_courses && (
                                                    <div className="flex items-center gap-1.5">
                                                        <GraduationCap
                                                            size={13}
                                                            style={{ color: "#3282B8" }}
                                                        />
                                                        <span
                                                            style={{
                                                                fontSize: "12.5px",
                                                                fontWeight: 600,
                                                                color: "#0F172A",
                                                            }}
                                                        >
                                                            {course.instructor_courses} Courses
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bio — sirf agar backend se aata hai */}
                                        {course.instructor_bio && (
                                            <p
                                                style={{
                                                    fontSize: "13.5px",
                                                    color: "#475569",
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                {course.instructor_bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </ContentCard>
                        )}

                        {/* Course Details */}
                        <ContentCard title="Course Details">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "Level", value: course.level, cap: true },
                                    { label: "Language", value: course.language },
                                    { label: "Category", value: course.category_name },
                                    {
                                        label: "Certificate",
                                        value:
                                            course.certificate_eligible === 1 ? "Included" : "Not included",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-xl px-4 py-3.5"
                                        style={{ background: "#F8FAFC", border: "1px solid #EEF2F7" }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 700,
                                                color: "#94A3B8",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            {item.label}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "13.5px",
                                                fontWeight: 600,
                                                color: "#0F172A",
                                                textTransform: item.cap ? "capitalize" : "none",
                                            }}
                                        >
                                            {item.value || "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ContentCard>
                    </div>

                    {/* ── Reviews Section ───────────────────────────── */}
                    <div className="flex-1 space-y-5">
                        <ContentCard title="Student Reviews">
                            <div className="space-y-6">
                                {/* Review Stats */}
                                <ReviewStats courseId={course?.id} />

                                {/* Review Form - Only show if enrolled */}
                                {isEnrolled && (
                                    <ReviewForm
                                        courseId={course?.id}
                                        onReviewSubmitted={() => {
                                            // Refresh reviews after submission
                                            // This will trigger a re-render of ReviewList
                                        }}
                                    />
                                )}

                                {/* Reviews List */}
                                <ReviewList courseId={course?.id} />
                            </div>
                        </ContentCard>
                    </div>

                    {/* ── RIGHT — enroll card ── */}
                    <div className="w-full lg:w-[320px] xl:w-[340px] lg:shrink-0">
                        <CourseEnrollCard course={course} isEnrolled={isEnrolled} onEnroll={handleEnroll} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatPill({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.58)" }}>
            <Icon size={13} />
            <span style={{ fontSize: "13px" }}>{label}</span>
        </div>
    );
}

function ContentCard({ title, children }) {
    return (
        <div
            className="bg-white rounded-2xl p-6"
            style={{ border: "1px solid #EEF2F7", boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
        >
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-[3px] h-5 rounded-full bg-primary shrink-0" />
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>{title}</h2>
            </div>
            {children}
        </div>
    );
}

function CourseDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#F1F5F9]">
            <div
                className="h-[260px] animate-pulse"
                style={{ background: "linear-gradient(135deg, #0a1628, #162d5a)" }}
            />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-5">
                        {Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl p-6 animate-pulse"
                                    style={{ border: "1px solid #EEF2F7" }}
                                >
                                    <div className="h-4 bg-[#F1F5F9] rounded-full w-36 mb-5" />
                                    <div className="space-y-2.5">
                                        <div className="h-3 bg-[#F1F5F9] rounded-full w-full" />
                                        <div className="h-3 bg-[#F1F5F9] rounded-full w-4/5" />
                                        <div className="h-3 bg-[#F1F5F9] rounded-full w-3/5" />
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className="w-full lg:w-[320px] shrink-0">
                        <div
                            className="bg-white rounded-2xl animate-pulse h-[460px]"
                            style={{ border: "1px solid #EEF2F7" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
