import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Clock, BarChart2, BookOpen, Award, Globe, PlayCircle, CheckCircle, X } from "lucide-react";
import { selectIsLoggedIn } from "@/features/auth/authSlice";

/**
 * CourseEnrollCard.jsx
 *
 * Desktop → sticky right sidebar
 * Mobile  → full width below content
 * Both handled by parent (CourseDetailIndex)
 */

function formatDuration(mins) {
    if (!mins || mins === 0) return "Self-paced";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

// Single reusable enroll button — color always #3282B8
function EnrollButton({ onClick, href, children }) {
    const style = {
        width: "100%",
        height: "44px",
        background: "#3282B8",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "background 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: "0 2px 8px rgba(50,130,184,0.30)",
        textDecoration: "none",
    };

    if (href) {
        return (
            <Link
                to={href}
                style={style}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            style={style}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
        >
            {children}
        </button>
    );
}

export default function CourseEnrollCard({ course, isEnrolled = false, onEnroll }) {
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    if (!course) return null;

    const {
        thumbnail,
        price,
        level,
        language,
        total_duration,
        total_lessons,
        certificate_eligible,
        preview_video,
    } = course;

    const META = [
        { icon: Clock, label: "Duration", value: formatDuration(total_duration) },
        {
            icon: BarChart2,
            label: "Level",
            value: level ? level.charAt(0).toUpperCase() + level.slice(1) : "All levels",
        },
        ...(total_lessons > 0
            ? [{ icon: BookOpen, label: "Lessons", value: `${total_lessons} lessons` }]
            : []),
        { icon: Globe, label: "Language", value: language || "English" },
        ...(certificate_eligible === 1 ? [{ icon: Award, label: "Certificate", value: "Included" }] : []),
    ];

    return (
        <>
            <div
                className="bg-white rounded-2xl overflow-hidden lg:sticky lg:top-[86px]"
                style={{ border: "1px solid #EEF2F7", boxShadow: "0 4px 24px rgba(15,23,42,0.08)" }}
            >
                {/* Thumbnail */}
                <div
                    onClick={() => preview_video && setShowPreviewModal(true)}
                    className={`relative h-[180px] overflow-hidden ${preview_video ? "cursor-pointer group" : ""}`}
                    style={{ background: "linear-gradient(135deg, #0a1628 0%, #162d5a 100%)" }}
                >
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={course.title}
                            className={`w-full h-full object-cover transition-transform duration-300 ${preview_video ? "group-hover:scale-105" : ""}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <BookOpen
                                    size={36}
                                    style={{ color: "rgba(255,255,255,0.18)", margin: "0 auto 8px" }}
                                />
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "rgba(255,255,255,0.28)",
                                        fontWeight: 600,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Course Preview
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Overlay */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                        }}
                    />

                    {/* Play button — only if preview exists */}
                    {preview_video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110 shadow-lg"
                                style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)" }}
                            >
                                <PlayCircle size={30} style={{ color: "#fff" }} />
                            </div>
                        </div>
                    )}
                </div>

            {/* Body */}
            <div className="p-5">
                {/* Price */}
                <div className="mb-5">
                    <span
                        style={{
                            fontSize: "32px",
                            fontWeight: 800,
                            color: "#0F172A",
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                        }}
                    >
                        ${price}
                    </span>
                </div>

                {/* CTA */}
                {isEnrolled ? (
                    <EnrollButton href={`/student/course/${course.id}/learn`}>
                        <PlayCircle size={16} />
                        Continue Learning
                    </EnrollButton>
                ) : isLoggedIn ? (
                    <EnrollButton onClick={onEnroll}>Enroll Now</EnrollButton>
                ) : (
                    <EnrollButton onClick={onEnroll}>Login to Enroll</EnrollButton>
                )}

                {/* Guarantee */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    <CheckCircle size={12} style={{ color: "#10B981" }} />
                    <p style={{ fontSize: "11.5px", color: "#64748B" }}>30-day money-back guarantee</p>
                </div>

                {/* Divider */}
                <div className="my-4" style={{ height: "1px", background: "#F1F5F9" }} />

                {/* Meta list */}
                <div className="space-y-3">
                    {META.map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                            <item.icon size={14} style={{ color: "#3282B8", flexShrink: 0 }} />
                            <span style={{ fontSize: "12.5px", color: "#64748B", flex: 1 }}>
                                {item.label}
                            </span>
                            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F172A" }}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Certificate badge */}
                {certificate_eligible === 1 && (
                    <>
                        <div className="my-4" style={{ height: "1px", background: "#F1F5F9" }} />
                        <div
                            className="flex items-center gap-2.5 rounded-xl px-3.5 py-3"
                            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                        >
                            <Award size={15} style={{ color: "#3282B8", flexShrink: 0 }} />
                            <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#1D4ED8" }}>
                                Certificate of completion included
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Video Preview Modal */}
        {showPreviewModal && preview_video && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)" }}
                onClick={() => setShowPreviewModal(false)}
            >
                <div
                    className="relative w-full max-w-3xl bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#162238]">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                                Free Preview
                            </span>
                            <h3 className="text-sm font-medium text-white truncate">
                                {course.title}
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                            aria-label="Close preview"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Video Player */}
                    <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                        <video
                            src={preview_video}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>
        )}
    </>
    );
}
