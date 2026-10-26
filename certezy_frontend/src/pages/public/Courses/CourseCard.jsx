import { Link } from "react-router-dom";
import { Star, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CourseCard.jsx
 *
 * Thumbnail logic:
 *   - thumbnail aata hai backend se → <img> dikhao
 *   - thumbnail null/undefined    → category-based gradient + course initials (fallback)
 */

// Category se gradient map — slug based
const CATEGORY_GRADIENTS = {
    "cloud-computing": { from: "#0EA5E9", to: "#0369A1", text: "#E0F2FE" },
    "cyber-security": { from: "#EF4444", to: "#991B1B", text: "#FEE2E2" },
    devops: { from: "#8B5CF6", to: "#5B21B6", text: "#EDE9FE" },
    "data-science": { from: "#10B981", to: "#065F46", text: "#D1FAE5" },
    "project-management": { from: "#F59E0B", to: "#92400E", text: "#FEF3C7" },
    networking: { from: "#3B82F6", to: "#1E3A8A", text: "#DBEAFE" },
    "it-service-management": { from: "#EC4899", to: "#9D174D", text: "#FCE7F3" },
    "software-development": { from: "#14B8A6", to: "#134E4A", text: "#CCFBF1" },
};

// Default fallback agar category slug match na kare
const DEFAULT_GRADIENT = { from: "#3282B8", to: "#0a1628", text: "#E0F2FE" };

// Course title se initials — "AWS Solutions Architect" → "AS"
function getInitials(title = "") {
    return title
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

// Level styles
const LEVEL_STYLES = {
    beginner: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    intermediate: { bg: "bg-blue-50    text-blue-700    border-blue-200", dot: "bg-blue-500" },
    advanced: { bg: "bg-violet-50  text-violet-700  border-violet-200", dot: "bg-violet-500" },
};

function formatDuration(mins) {
    if (!mins || mins === 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

function getCourseBadge(enrolled_count, created_at) {
    if (enrolled_count >= 100) {
        return { label: "Bestseller", style: "bg-amber-400 text-amber-900" };
    }
    if (created_at) {
        const days = (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 30) return { label: "New", style: "bg-emerald-500 text-white" };
    }
    return null;
}

export default function CourseCard({ course }) {
    const {
        id,
        title = "",
        slug = "", // Add fallback for missing slug
        thumbnail, // backend se aayega — null hone pe fallback
        price,
        level,
        category_name,
        category_slug = "", // gradient ke liye
        rating_avg = 0,
        rating_count = 0,
        enrolled_count = 0,
        total_duration = 0,
        certificate_eligible,
        instructor_name,
        created_at,
    } = course;

    const duration = formatDuration(total_duration);
    const badge = getCourseBadge(enrolled_count, created_at);
    const levelStyle = LEVEL_STYLES[level];
    const gradient = CATEGORY_GRADIENTS[category_slug] || DEFAULT_GRADIENT;
    const initials = getInitials(title);

    return (
        <Link
            to={slug ? `/courses/${slug}` : `/courses/${id}`}
            className="group bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer"
            style={{
                border: "1px solid #EEF2F7",
                boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.12)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "#DBEAFE";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#EEF2F7";
            }}
        >
            {/* ── Thumbnail ─────────────────────────────────── */}
            <div className="relative h-[176px] overflow-hidden">
                {thumbnail ? (
                    /* Backend se thumbnail aaya — image dikhao */
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    /* Fallback — category gradient + course initials */
                    <div
                        className="w-full h-full flex flex-col items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                        }}
                    >
                        {/* Subtle dot pattern */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                opacity: 0.06,
                                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                            }}
                        />
                        {/* Initials */}
                        <span
                            style={{
                                fontSize: "32px",
                                fontWeight: 800,
                                color: gradient.text,
                                letterSpacing: "-0.02em",
                                opacity: 0.9,
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            {initials}
                        </span>
                        {/* Category name */}
                        <span
                            style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: gradient.text,
                                opacity: 0.55,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginTop: "6px",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            {category_name}
                        </span>
                    </div>
                )}

                {/* Gradient overlay — readability */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 60%)",
                    }}
                />

                {/* Bestseller / New badge — top left */}
                {badge && (
                    <div className="absolute top-3 left-3">
                        <span
                            className={cn(
                                "text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full",
                                badge.style
                            )}
                        >
                            {badge.label}
                        </span>
                    </div>
                )}

                {/* Certificate badge — top right */}
                {certificate_eligible === 1 && (
                    <div className="absolute top-3 right-3">
                        <span
                            className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(50,130,184,0.85)", backdropFilter: "blur(4px)" }}
                        >
                            Certificate
                        </span>
                    </div>
                )}

                {/* Category — bottom left */}
                <div className="absolute bottom-3 left-3">
                    <span
                        className="text-[10.5px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
                    >
                        {category_name}
                    </span>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3
                    className="line-clamp-2 group-hover:text-primary transition-colors duration-200"
                    style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: 1.45,
                        marginBottom: "6px",
                    }}
                >
                    {title}
                </h3>

                {/* Instructor */}
                {instructor_name && (
                    <p
                        style={{ fontSize: "11.5px", color: "#94A3B8", marginBottom: "10px" }}
                        className="truncate"
                    >
                        {instructor_name}
                    </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                        {Array(5)
                            .fill(0)
                            .map((_, i) => (
                                <Star
                                    key={i}
                                    size={11}
                                    className={cn(
                                        i < Math.round(rating_avg)
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-[#E2E8F0] fill-[#E2E8F0]"
                                    )}
                                />
                            ))}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>
                        {rating_avg > 0 ? Number(rating_avg).toFixed(1) : "New"}
                    </span>
                    {rating_count > 0 && (
                        <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                            ({rating_count.toLocaleString()})
                        </span>
                    )}
                </div>

                <div className="flex-1" />

                {/* Level pill */}
                {levelStyle && (
                    <div className="mb-3">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize",
                                levelStyle.bg
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", levelStyle.dot)} />
                            {level}
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: "1px", background: "#F1F5F9", marginBottom: "12px" }} />

                {/* Duration + Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                        {duration ? (
                            <>
                                <Clock size={12} />
                                <span style={{ fontSize: "12px" }}>{duration}</span>
                            </>
                        ) : enrolled_count > 0 ? (
                            <>
                                <Users size={12} />
                                <span style={{ fontSize: "12px" }}>
                                    {enrolled_count >= 1000
                                        ? `${(enrolled_count / 1000).toFixed(1)}k`
                                        : enrolled_count}{" "}
                                    students
                                </span>
                            </>
                        ) : (
                            <span style={{ fontSize: "12px" }}>Self-paced</span>
                        )}
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#3282B8" }}>${price}</span>
                </div>
            </div>
        </Link>
    );
}
