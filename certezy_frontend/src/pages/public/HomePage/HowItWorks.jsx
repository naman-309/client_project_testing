import { Link } from "react-router-dom";
import { Search, BookOpen, BadgeCheck, ArrowRight } from "lucide-react";

const CSS = `
  @keyframes hiwFadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .hiw-f0 { animation: hiwFadeUp .55s .00s ease both; }
  .hiw-f1 { animation: hiwFadeUp .55s .10s ease both; }
  .hiw-f2 { animation: hiwFadeUp .55s .18s ease both; }
  .hiw-f3 { animation: hiwFadeUp .55s .26s ease both; }
  .hiw-f4 { animation: hiwFadeUp .55s .34s ease both; }

  .hiw-card {
    background: #0D1929;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    padding: 36px 32px 32px;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
  }
  .hiw-card:hover {
    border-color: rgba(50,130,184,0.3);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(50,130,184,0.1);
    transform: translateY(-4px);
  }

  .hiw-icon-box {
    width: 50px; height: 50px;
    border-radius: 14px;
    background: rgba(50,130,184,0.12);
    border: 1px solid rgba(50,130,184,0.22);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background .25s ease;
  }
  .hiw-card:hover .hiw-icon-box {
    background: rgba(50,130,184,0.2);
  }

  .hiw-cta {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 15px 34px;
    border-radius: 14px;
    background: #3282B8;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 8px 28px rgba(50,130,184,0.4);
    transition: opacity .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .hiw-cta:hover {
    opacity: .92;
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(50,130,184,0.5);
  }

  /* connector dashes between cards */
  .hiw-connector {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding-bottom: 40px;   /* align with card mid */
  }
  .hiw-dash {
    width: 40px;
    border-top: 2px dashed rgba(50,130,184,0.25);
  }

  /* ── Grid ── */
  .hiw-row {
    display: flex;
    align-items: stretch;
    gap: 0;
  }
  .hiw-card-wrap {
    flex: 1;
    min-width: 0;
  }

  /* ── Responsive ── */
  .hiw-heading { font-size: 46px; }

  @media (max-width: 1100px) {
    .hiw-heading { font-size: 40px !important; }
  }
  @media (max-width: 900px) {
    .hiw-row        { flex-direction: column; gap: 16px; }
    .hiw-connector  { display: none; }
    .hiw-heading    { font-size: 34px !important; }
    .hiw-section    { padding: 70px 0 !important; }
  }
  @media (max-width: 640px) {
    .hiw-heading  { font-size: 28px !important; line-height:1.2 !important; }
    .hiw-card     { padding: 28px 24px 26px; }
    .hiw-section  { padding: 56px 0 !important; }
  }
  @media (max-width: 480px) {
    .hiw-heading { font-size: 24px !important; }
    .hiw-cta     { padding: 13px 26px; font-size: 14px; }
  }
`;

const STEPS = [
    {
        num: "01",
        Icon: Search,
        title: "Browse Courses",
        desc: "Explore our comprehensive catalog of expert-led courses across technology, design, and business domains.",
        tag: "5,000+ Curated Lessons",
    },
    {
        num: "02",
        Icon: BookOpen,
        title: "Enroll & Learn",
        desc: "Get instant access to interactive modules, hands-on projects, and a community of peer learners.",
        tag: "Personalized Dashboard",
    },
    {
        num: "03",
        Icon: BadgeCheck,
        title: "Get Certified",
        desc: "Validate your expertise with certificates that are easily shared to LinkedIn and respected by top employers.",
        tag: "Industry Recognition",
    },
];

export default function HowItWorks() {
    return (
        <>
            <style>{CSS}</style>

            <section
                className="hiw-section"
                aria-label="How Certezy works — 3 simple steps"
                style={{
                    background: "#0B1120",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "90px 0 100px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
            >
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                    {/* ── Header ── */}
                    <div className="hiw-f0" style={{ textAlign: "center", marginBottom: "56px" }}>
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
                            How It Works
                        </p>

                        <h2
                            className="hiw-heading"
                            style={{
                                fontWeight: 900,
                                lineHeight: 1.1,
                                letterSpacing: "-0.025em",
                                color: "#F1F5F9",
                                marginBottom: "18px",
                            }}
                        >
                            Start Learning in{" "}
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #3282B8 0%, #6C3BD5 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                3 Simple
                            </span>{" "}
                            Steps
                        </h2>

                        <p
                            style={{
                                fontSize: "15.5px",
                                color: "#64748B",
                                lineHeight: 1.7,
                                maxWidth: "520px",
                                margin: "0 auto",
                            }}
                        >
                            Join thousands of professionals advancing their careers with our curated learning
                            paths and industry-recognized certifications.
                        </p>
                    </div>

                    {/* ── Steps row ── */}
                    <div className="hiw-row hiw-f1">
                        {STEPS.map(({ num, Icon, title, desc, tag }, i) => (
                            <>
                                {/* Card */}
                                <div key={title} className="hiw-card-wrap">
                                    <article className="hiw-card" style={{ height: "100%" }}>
                                        {/* Top row: number + icon */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                marginBottom: "28px",
                                            }}
                                        >
                                            {/* Faded step number */}
                                            <span
                                                style={{
                                                    fontSize: "72px",
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: "rgba(50,130,184,0.18)",
                                                    letterSpacing: "-0.04em",
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    userSelect: "none",
                                                }}
                                                aria-hidden="true"
                                            >
                                                {num}
                                            </span>

                                            {/* Icon box */}
                                            <div className="hiw-icon-box" aria-hidden="true">
                                                <Icon size={22} color="#3282B8" strokeWidth={1.8} />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 800,
                                                color: "#F1F5F9",
                                                lineHeight: 1.3,
                                                marginBottom: "12px",
                                            }}
                                        >
                                            {title}
                                        </h3>

                                        {/* Description */}
                                        <p
                                            style={{
                                                fontSize: "13.5px",
                                                color: "#64748B",
                                                lineHeight: 1.7,
                                                flex: 1,
                                                marginBottom: "28px",
                                            }}
                                        >
                                            {desc}
                                        </p>

                                        {/* Divider */}
                                        <div
                                            style={{
                                                height: "1px",
                                                background: "rgba(255,255,255,0.06)",
                                                marginBottom: "18px",
                                            }}
                                        />

                                        {/* Bottom tag */}
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                color: "#3282B8",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {tag}
                                        </p>
                                    </article>
                                </div>

                                {/* Connector dashes between cards */}
                                {i < STEPS.length - 1 && (
                                    <div key={`conn-${i}`} className="hiw-connector">
                                        <div className="hiw-dash" />
                                    </div>
                                )}
                            </>
                        ))}
                    </div>

                    {/* ── CTA Button ── */}
                    <div className="hiw-f2" style={{ textAlign: "center", marginTop: "60px" }}>
                        <Link
                            to="/register"
                            className="hiw-cta"
                            aria-label="Start your learning journey with Certezy"
                        >
                            Start Your Journey <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
