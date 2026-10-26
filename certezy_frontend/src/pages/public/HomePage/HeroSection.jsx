import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Star, CheckCircle2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Only animations + a few layout helpers that Tailwind can't express.
   All colours are CSS variables → one place to tweak the whole page.
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  :root {
    --c-bg:       #0B1120;
    --c-blue:     #3282B8;
    --c-blue-d:   #1A5F8A;
    --c-text:     #F1F5F9;
    --c-muted:    #94A3B8;
  }

  /* GPU-only — no layout recalc */
  @keyframes heroFadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes cardLift {
    0%,100% { transform: translateY(0px);   }
    50%      { transform: translateY(-8px);  }
  }
  @keyframes progFill {
    from { width:0% }
    to   { width:75% }
  }
  @keyframes glowPulse {
    0%,100% { opacity:.35; }
    50%      { opacity:.6;  }
  }

  .afu1 { animation: heroFadeUp .55s .00s ease both; }
  .afu2 { animation: heroFadeUp .55s .08s ease both; }
  .afu3 { animation: heroFadeUp .55s .16s ease both; }
  .afu4 { animation: heroFadeUp .55s .24s ease both; }
  .afu5 { animation: heroFadeUp .55s .32s ease both; }
  .afu6 { animation: heroFadeUp .55s .40s ease both; }

  .card-hover {
    will-change: transform;
    animation: cardLift 4.5s ease-in-out infinite;
  }

  .prog-anim {
    animation: progFill 1.8s .9s ease both;
    width: 0%;
  }

  .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }

  /* ── RESPONSIVE ─────────────────────────────────────────────────── */
  .hero-wrap {
    display: flex;
    align-items: center;
    gap: 48px;
    padding: 72px 0 0;
    min-height: calc(100svh - 68px);
  }
  .hero-left  { flex: 1.05; min-width: 0; }
  .hero-right { flex: .95;  min-width: 0; display:flex; justify-content:center; }

  /* bottom cards strip */
  .bottom-cards {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 24px;
    margin-top: -60px;
    position: relative;
    z-index: 10;
    overflow: visible;
  }
  .bcard {
    flex-shrink: 0;
    width: 220px;
    background: #fff;
    border-radius: 20px;
    padding: 22px 20px 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    position: relative;
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .bcard:hover { transform: translateY(-6px) !important; box-shadow: 0 28px 72px rgba(0,0,0,0.45) !important; }

  /* staggered overlap */
  .bcard:nth-child(1) { transform: rotate(-4deg) translateY(10px);  z-index:1; }
  .bcard:nth-child(2) { transform: rotate(-1.5deg) translateY(-4px); z-index:2; margin-left:-28px; }
  .bcard:nth-child(3) { transform: rotate(2deg) translateY(6px);    z-index:3; margin-left:-28px; }
  .bcard:nth-child(4) { transform: rotate(5deg) translateY(14px);   z-index:2; margin-left:-28px; }

  /* large screens */
  @media (min-width: 1400px) {
    .hero-container { max-width: 1320px !important; }
    .hero-title     { font-size: 68px !important; }
    .bcard          { width: 240px; }
  }

  /* 1024 – 1280 */
  @media (max-width: 1280px) {
    .hero-title { font-size: 52px !important; }
    .bcard      { width: 200px; }
  }

  /* tablet landscape 900 – 1024 */
  @media (max-width: 1024px) {
    .hero-title { font-size: 46px !important; }
    .hero-wrap  { gap: 32px; }
    .bcard      { width: 182px; padding: 18px 16px; }
  }

  /* tablet portrait 768 – 900 */
  @media (max-width: 900px) {
    .hero-wrap   { flex-direction: column; padding: 52px 0 0; min-height: auto; }
    .hero-left   { text-align: center; }
    .hero-right  { width: 100%; justify-content: center; }
    .hero-title  { font-size: 44px !important; }
    .stat-sep    { display: none; }
    .bottom-cards{ padding: 0 16px; justify-content: center; margin-top: -40px; }
    .bcard       { width: 165px; }
    .bcard:nth-child(4){ display:none; }
  }

  /* mobile 640 – 768 */
  @media (max-width: 768px) {
    .hero-title  { font-size: 38px !important; line-height:1.12 !important; }
    .hero-desc   { font-size: 15px !important; }
    .btn-row     { flex-wrap: wrap; }
    .bcard       { width: 150px; padding:16px 14px; }
    .bcard:nth-child(3){ display:none; }
  }

  /* mobile 480 – 640 */
  @media (max-width: 640px) {
    .hero-title  { font-size: 32px !important; }
    .hero-wrap   { padding: 40px 0 0; }
    .bottom-cards{ margin-top: -24px; }
    .bcard       { width: 145px; }
  }

  /* small mobile < 480 */
  @media (max-width: 480px) {
    .hero-title   { font-size: 28px !important; }
    .btn-row      { flex-direction: column; }
    .btn-row a    { text-align:center; justify-content:center; width:100%; }
    .bcard        { width: 135px; padding:14px 12px; }
    .bcard:nth-child(2){ display:none; }
  }
`;

/* ── Course icon colours ─────────────────────────────────────────────────── */
const ICON_COLORS = {
    react: { bg: "#EFF6FF", color: "#3B82F6" },
    aws: { bg: "#FFF7ED", color: "#F97316" },
    cyber: { bg: "#FEF2F2", color: "#EF4444" },
    devops: { bg: "#F0FDF4", color: "#22C55E" },
};

/* ── SVG icons (inline so zero extra requests) ──────────────────────────── */
function IconReact() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M9 3L5 7m0 0L9 11M5 7h8m2 10 4-4m0 0-4-4m4 4H7"
                stroke="#3282B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconAWS() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="7" width="18" height="12" rx="3" stroke="#F97316" strokeWidth="2" />
            <path
                d="M3 11h18M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
function IconCyber() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4Z"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function IconDevOps() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 3v4M12 17v4M4.22 6.22l2.83 2.83M16.95 16.95l2.83 2.83M3 12h4M17 12h4M4.22 17.78l2.83-2.83M16.95 7.05l2.83-2.83"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

/* ── Bottom course cards data ────────────────────────────────────────────── */
const BOTTOM_COURSES = [
    {
        icon: <IconReact />,
        iconBg: ICON_COLORS.react,
        title: "React Development",
        lessons: 24,
        hours: "12.5",
    },
    { icon: <IconAWS />, iconBg: ICON_COLORS.aws, title: "AWS Certification", lessons: 42, hours: "30" },
    { icon: <IconCyber />, iconBg: ICON_COLORS.cyber, title: "Cyber Security", lessons: 18, hours: "15" },
    {
        icon: <IconDevOps />,
        iconBg: ICON_COLORS.devops,
        title: "DevOps Engineering",
        lessons: 36,
        hours: "24",
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════════════════════ */
export default function HeroSection() {
    return (
        <>
            <style>{STYLES}</style>

            {/* SEO: semantic landmark, descriptive aria-label */}
            <section
                aria-label="Certezy — Industry-ready IT certification courses"
                style={{
                    background: "var(--c-bg)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    overflow: "hidden",
                }}
            >
                {/* ── Radial glow (single element, GPU opacity only) ─────────────── */}
                <div
                    aria-hidden="true"
                    className="glow-pulse"
                    style={{
                        position: "absolute",
                        top: "10%",
                        right: "8%",
                        width: "520px",
                        height: "520px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 68%)",
                        pointerEvents: "none",
                    }}
                />

                {/* ── Container ──────────────────────────────────────────────────── */}
                <div
                    className="hero-container"
                    style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 24px", position: "relative" }}
                >
                    {/* ══ HERO ROW ══════════════════════════════════════════════════ */}
                    <div className="hero-wrap">
                        {/* ════ LEFT ═══════════════════════════════════════════════ */}
                        <div className="hero-left">
                            {/* CompTIA badge — SEO: meaningful text, not just decorative */}
                            <div className="afu1" style={{ marginBottom: "24px" }}>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "7px 16px",
                                        borderRadius: "100px",
                                        border: "1px solid rgba(59,130,246,0.35)",
                                        background: "rgba(59,130,246,0.08)",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "#93C5FD",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    <ShieldCheck size={14} color="#3282B8" aria-hidden="true" />
                                    CompTIA Authorized Partner
                                </span>
                            </div>

                            {/* H1 — primary SEO keyword */}
                            <h1
                                className="afu2 hero-title"
                                style={{
                                    fontSize: "60px",
                                    fontWeight: 900,
                                    lineHeight: 1.07,
                                    letterSpacing: "-0.03em",
                                    color: "var(--c-text)",
                                    marginBottom: "20px",
                                }}
                            >
                                Become Industry-Ready <br />
                                with{" "}
                                <span
                                    style={{
                                        background: "linear-gradient(90deg, #3282B8 0%, #38BDF8 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    Certezy
                                </span>
                            </h1>

                            {/* Description — SEO: natural keywords */}
                            <p
                                className="afu3 hero-desc"
                                style={{
                                    fontSize: "16.5px",
                                    color: "var(--c-muted)",
                                    lineHeight: 1.72,
                                    maxWidth: "480px",
                                    marginBottom: "32px",
                                }}
                            >
                                We are a trusted CompTIA authorized partner delivering expert IT training,
                                certifications, and real-world skills for modern technology careers.
                            </p>

                            {/* Trust proof row */}
                            <div
                                className="afu3"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    marginBottom: "32px",
                                }}
                            >
                                {[
                                    "Making LEARNING way easier and convenient for you",
                                    "Expert-led courses: AWS, Azure, DevOps, Cyber Security",
                                ].map((t) => (
                                    <div
                                        key={t}
                                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <CheckCircle2
                                            size={15}
                                            color="#3282B8"
                                            aria-hidden="true"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <span
                                            style={{ fontSize: "13.5px", color: "#CBD5E1", fontWeight: 500 }}
                                        >
                                            {t}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA buttons */}
                            <div
                                className="afu4 btn-row"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "14px",
                                    marginBottom: "40px",
                                }}
                            >
                                <Link
                                    to="/courses"
                                    aria-label="Explore all IT certification courses"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "14px 26px",
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, #3282B8 0%, #1A5F8A 100%)",
                                        color: "#fff",
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        boxShadow: "0 6px 24px rgba(50,130,184,0.45)",
                                        transition: "transform .2s ease, box-shadow .2s ease",
                                        whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 10px 32px rgba(59,130,246,0.55)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "";
                                        e.currentTarget.style.boxShadow = "0 6px 24px rgba(59,130,246,0.45)";
                                    }}
                                >
                                    Explore Courses <ArrowRight size={16} aria-hidden="true" />
                                </Link>

                                <Link
                                    to="/certifications"
                                    aria-label="View certification programs"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "13px 26px",
                                        borderRadius: "12px",
                                        border: "1.5px solid rgba(255,255,255,0.18)",
                                        color: "var(--c-text)",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        background: "rgba(255,255,255,0.04)",
                                        backdropFilter: "blur(6px)",
                                        transition: "background .2s ease, transform .2s ease",
                                        whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                        e.currentTarget.style.transform = "";
                                    }}
                                >
                                    View Certifications
                                </Link>
                            </div>

                            {/* Stats */}
                            <div
                                className="afu5"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "28px",
                                    flexWrap: "wrap",
                                }}
                            >
                                {[
                                    { val: "10,000+", label: "LEARNERS ACTIVE" },
                                    { val: "Industry ✔", label: "RECOGNIZED CERTS", blue: true },
                                ].map(({ val, label, blue }, i) => (
                                    <div
                                        key={label}
                                        style={{ display: "flex", alignItems: "center", gap: "12px" }}
                                    >
                                        {i > 0 && (
                                            <div
                                                className="stat-sep"
                                                style={{
                                                    width: "1px",
                                                    height: "36px",
                                                    background: "rgba(255,255,255,0.12)",
                                                }}
                                            />
                                        )}
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: blue ? "#3282B8" : "var(--c-text)",
                                                    letterSpacing: "-0.02em",
                                                }}
                                            >
                                                {val}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "10.5px",
                                                    fontWeight: 700,
                                                    color: "var(--c-muted)",
                                                    letterSpacing: "0.08em",
                                                    marginTop: "3px",
                                                }}
                                            >
                                                {label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ════ RIGHT ══════════════════════════════════════════════ */}
                        <div className="hero-right afu6">
                            <div style={{ position: "relative", width: "100%", maxWidth: "460px" }}>
                                {/* Main course card — taller height */}
                                <div
                                    className="card-hover"
                                    style={{
                                        background: "#fff",
                                        borderRadius: "24px",
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(59,130,246,0.18)",
                                    }}
                                >
                                    {/* Card top */}
                                    <div style={{ padding: "28px 28px 0" }}>
                                        {/* Cloud icon */}
                                        <div
                                            style={{
                                                width: "56px",
                                                height: "56px",
                                                borderRadius: "16px",
                                                background: "#EFF6FF",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M6.5 18a4.5 4.5 0 0 1 0-9h.09A5.5 5.5 0 0 1 17 10.5a3.5 3.5 0 0 1-.5 6.97"
                                                    stroke="#3282B8"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Rating */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-end",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            <Star
                                                size={14}
                                                fill="#F59E0B"
                                                color="#F59E0B"
                                                aria-hidden="true"
                                            />
                                            <span
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 800,
                                                    color: "#0F172A",
                                                    marginLeft: "5px",
                                                }}
                                            >
                                                4.9
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 800,
                                                color: "#0F172A",
                                                lineHeight: 1.3,
                                                marginBottom: "12px",
                                            }}
                                        >
                                            AWS Certified Solutions Architect
                                        </h2>

                                        {/* Description */}
                                        <p
                                            style={{
                                                fontSize: "13.5px",
                                                color: "#64748B",
                                                lineHeight: 1.65,
                                                marginBottom: "20px",
                                            }}
                                        >
                                            Master the architectural principles and services of AWS to design
                                            and deploy highly available systems.
                                        </p>

                                        {/* Instructors */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "24px",
                                            }}
                                        >
                                            <div style={{ display: "flex" }}>
                                                {["#3282B8", "#6C3BD5"].map((c, i) => (
                                                    <div
                                                        key={i}
                                                        aria-hidden="true"
                                                        style={{
                                                            width: "38px",
                                                            height: "38px",
                                                            borderRadius: "50%",
                                                            background: `linear-gradient(135deg, ${c}, ${c}aa)`,
                                                            border: "2.5px solid #fff",
                                                            marginLeft: i ? "-10px" : 0,
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    color: "#0F172A",
                                                }}
                                            >
                                                12+ Instructors
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: "1px", background: "#F1F5F9", margin: "0 28px" }} />

                                    {/* Card bottom — progress section */}
                                    <div style={{ padding: "20px 28px 26px" }}>
                                        {/* Labels */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    color: "#3282B8",
                                                    letterSpacing: "0.07em",
                                                }}
                                            >
                                                POPULAR CHOICE
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    color: "#6366F1",
                                                    letterSpacing: "0.07em",
                                                }}
                                            >
                                                75% ENROLLMENT
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div
                                            style={{
                                                height: "8px",
                                                background: "#EEF2FF",
                                                borderRadius: "99px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                className="prog-anim"
                                                style={{
                                                    height: "100%",
                                                    borderRadius: "99px",
                                                    background:
                                                        "linear-gradient(90deg, #3282B8 0%, #6C3BD5 100%)",
                                                }}
                                                role="progressbar"
                                                aria-valuenow={75}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label="Course enrollment 75%"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* ════ END RIGHT ══════════════════════════════════════════ */}
                    </div>
                </div>

                {/* ══ BOTTOM FLOATING CARDS ════════════════════════════════════════ */}
                <div
                    className="bottom-cards"
                    aria-label="Featured course categories"
                    style={{ maxWidth: "900px", paddingBottom: "48px" }}
                >
                    {BOTTOM_COURSES.map(({ icon, iconBg, title, lessons, hours }, i) => (
                        <article
                            key={title}
                            className="bcard"
                            style={{
                                /* stagger animation delay per card */
                                animationDelay: `${i * 0.08}s`,
                            }}
                        >
                            {/* Icon */}
                            <div
                                aria-hidden="true"
                                style={{
                                    width: "46px",
                                    height: "46px",
                                    borderRadius: "13px",
                                    background: iconBg.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "14px",
                                    flexShrink: 0,
                                }}
                            >
                                {icon}
                            </div>

                            {/* Title */}
                            <h3
                                style={{
                                    fontSize: "14.5px",
                                    fontWeight: 800,
                                    color: "#0F172A",
                                    lineHeight: 1.3,
                                    marginBottom: "8px",
                                }}
                            >
                                {title}
                            </h3>

                            {/* Meta */}
                            <p style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}>
                                {lessons} Lessons &bull; {hours} Hours
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
