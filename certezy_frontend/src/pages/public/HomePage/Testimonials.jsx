import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { APP_NAME } from "@/config/app";
import reviewService from "@/services/reviewService";

/* ── Styles ─────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes tsFadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .ts-f0 { animation: tsFadeUp .55s .00s ease both; }
  .ts-f1 { animation: tsFadeUp .55s .08s ease both; }
  .ts-f2 { animation: tsFadeUp .55s .16s ease both; }
  .ts-f3 { animation: tsFadeUp .55s .24s ease both; }
  .ts-f4 { animation: tsFadeUp .55s .32s ease both; }

  .ts-card {
    background: #0F172A;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
  }
  .ts-card:hover {
    border-color: rgba(50,130,184,0.28);
    box-shadow: 0 20px 56px rgba(0,0,0,0.4);
    transform: translateY(-4px);
  }

  .ts-read-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    border-radius: 100px;
    border: 1.5px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.03);
    color: #F1F5F9;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background .2s ease, border-color .2s ease, transform .2s ease;
  }
  .ts-read-btn:hover {
    background: rgba(50,130,184,0.1);
    border-color: rgba(50,130,184,0.35);
    transform: translateY(-2px);
  }

  /* ── Grid ── */
  .ts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }

  /* ── Stats strip ── */
  .ts-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    flex-wrap: wrap;
  }
  .ts-stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 40px;
  }
  .ts-stat-divider {
    width: 1px;
    height: 32px;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
  }

  /* ── Responsive ── */
  .ts-heading { font-size: 48px; }

  @media (max-width: 1100px) {
    .ts-heading   { font-size: 40px !important; }
    .ts-stat-item { padding: 0 24px; }
  }
  @media (max-width: 900px) {
    .ts-grid    { grid-template-columns: repeat(2, 1fr); }
    .ts-heading { font-size: 34px !important; }
  }
  @media (max-width: 700px) {
    .ts-stats   { gap: 16px; }
    .ts-stat-item { padding: 0 16px; }
    .ts-stat-divider { display: none; }
  }
  @media (max-width: 640px) {
    .ts-grid    { grid-template-columns: 1fr; }
    .ts-heading { font-size: 28px !important; line-height:1.2 !important; }
    .ts-section { padding: 60px 0 !important; }
  }
  @media (max-width: 480px) {
    .ts-heading { font-size: 24px !important; }
  }
`;

/* ── Static fallback data (used until API responds) ─────────────────────── */

const TESTIMONIALS = [
    {
        id: 1,
        quote: "Certezy helped me crack the AWS Solutions Architect exam in just 6 weeks. The instructor quality is unmatched anywhere online.",
        name: "Rahul S.",
        role: "AWS Solutions Architect",
        company: "@Amazon",
        avatar: { initial: "R", color: "linear-gradient(135deg, #3282B8, #1A5F8A)" },
        rating: 5,
    },
    {
        id: 2,
        quote: "From zero to CompTIA certified in 2 months. The 1-on-1 support and live classes made all the difference for my career switch.",
        name: "Alex M.",
        role: "CompTIA Engineer",
        company: "@Microsoft",
        avatar: { initial: "A", color: "linear-gradient(135deg, #6C3BD5, #4C1D95)" },
        rating: 5,
    },
    {
        id: 3,
        quote: "Best investment I made for my IT career. Got promoted to Senior DevOps Engineer right after completing the course.",
        name: "Sarah K.",
        role: "Senior DevOps Engineer",
        company: "@Google",
        avatar: { initial: "S", color: "linear-gradient(135deg, #0891B2, #0E7490)" },
        rating: 5,
    },
];

const STATS = [
    { value: "96%", label: "Completion Rate" },
    { value: "4.9★", label: "Average Rating" },
    { value: "10K+", label: "Certified" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Testimonials() {
    const [testimonials, setTestimonials] = useState(TESTIMONIALS);

    // Static testimonials render immediately; real approved reviews replace them
    // when the public /reviews/featured endpoint returns data. No login needed.
    useEffect(() => {
        reviewService
            .getFeaturedReviews(3)
            .then((res) => {
                const data = res.data?.data;
                if (!Array.isArray(data) || data.length === 0) return;
                setTestimonials(
                    data.slice(0, 3).map((review) => ({
                        id: review.id,
                        quote: review.comment || "Great course experience!",
                        name: review.student_name || "Anonymous Student",
                        role: review.course_title || "Student",
                        company: `@${APP_NAME}`,
                        avatar: {
                            initial: (review.student_name || "A")[0].toUpperCase(),
                            color: "linear-gradient(135deg, #3282B8, #1A5F8A)",
                        },
                        rating: review.rating || 5,
                    }))
                );
            })
            .catch(() => {
                // Keep static testimonials on any error
            });
    }, []);

    return (
        <>
            <style>{CSS}</style>

            <section
                className="ts-section"
                aria-label="Student success stories and testimonials"
                style={{
                    background: "#0B1120",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "90px 0 100px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Subtle bg glow */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "20%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "700px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(50,130,184,0.05) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative" }}
                >
                    {/* ── Header ── */}
                    <div className="ts-f0" style={{ textAlign: "center", marginBottom: "40px" }}>
                        <p
                            style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "#475569",
                                marginBottom: "16px",
                            }}
                        >
                            Student Success Stories
                        </p>

                        <h2
                            className="ts-heading"
                            style={{
                                fontWeight: 900,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                color: "#F1F5F9",
                                marginBottom: "0",
                            }}
                        >
                            Trusted by{" "}
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #3282B8 0%, #6C3BD5 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                10,000+
                            </span>{" "}
                            Learners Worldwide
                        </h2>
                    </div>

                    {/* ── Stats strip ── */}
                    <div className="ts-stats ts-f1" style={{ marginBottom: "56px" }}>
                        {STATS.map(({ value, label }, i) => (
                            <>
                                {i > 0 && <div key={`div-${i}`} className="ts-stat-divider" />}
                                <div key={value} className="ts-stat-item">
                                    <span
                                        style={{
                                            fontSize: "26px",
                                            fontWeight: 900,
                                            color: "#3282B8",
                                            letterSpacing: "-0.02em",
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        }}
                                    >
                                        {value}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            color: "#94A3B8",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            </>
                        ))}
                    </div>

                    {/* ── Cards ── */}
                    <div className="ts-grid ts-f2">
                        {testimonials.map((t) => (
                            <article key={t.id} className="ts-card">
                                {/* Stars */}
                                <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill="#F59E0B"
                                            color="#F59E0B"
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>

                                {/* Quote mark */}
                                <div
                                    style={{
                                        fontSize: "52px",
                                        lineHeight: 1,
                                        color: "#3282B8",
                                        fontWeight: 900,
                                        marginBottom: "8px",
                                        fontFamily: "Georgia, serif",
                                        opacity: 0.85,
                                    }}
                                    aria-hidden="true"
                                >
                                    "
                                </div>

                                {/* Quote text */}
                                <p
                                    style={{
                                        fontSize: "15px",
                                        color: "#CBD5E1",
                                        lineHeight: 1.72,
                                        fontStyle: "italic",
                                        flex: 1,
                                        marginBottom: "24px",
                                    }}
                                >
                                    "{t.quote}"
                                </p>

                                {/* Divider */}
                                <div
                                    style={{
                                        height: "1px",
                                        background: "rgba(255,255,255,0.06)",
                                        marginBottom: "20px",
                                    }}
                                />

                                {/* Author */}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    {/* Avatar */}
                                    <div
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            borderRadius: "50%",
                                            background: t.avatar.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "16px",
                                            fontWeight: 800,
                                            color: "#fff",
                                            flexShrink: 0,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                        }}
                                        aria-hidden="true"
                                    >
                                        {t.avatar.initial}
                                    </div>

                                    {/* Name + role */}
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                color: "#F1F5F9",
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {t.name}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>
                                            {t.role} <span style={{ color: "#3282B8" }}>{t.company}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* ── Read More button ── */}
                    <div className="ts-f3" style={{ textAlign: "center", marginTop: "52px" }}>
                        <Link
                            to="/testimonials"
                            className="ts-read-btn"
                            aria-label="Read more student success stories"
                        >
                            Read More Stories <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
