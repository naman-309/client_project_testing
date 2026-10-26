import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, BadgeCheck, Clock } from "lucide-react";

const CSS = `
  @keyframes ctaFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .cta-f0 { animation: ctaFadeUp .55s .00s ease both; }
  .cta-f1 { animation: ctaFadeUp .55s .10s ease both; }
  .cta-f2 { animation: ctaFadeUp .55s .20s ease both; }
  .cta-f3 { animation: ctaFadeUp .55s .30s ease both; }

  .cta-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    font-size: 12.5px;
    font-weight: 600;
    color: #CBD5E1;
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
  }

  .cta-btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    padding: 17px 32px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3282B8 0%, #6C3BD5 100%);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 8px 28px rgba(50,130,184,0.42);
    transition: opacity .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .cta-btn-primary:hover {
    opacity: .9;
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(50,130,184,0.52);
  }

  .cta-btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px 32px;
    border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.03);
    color: #F1F5F9;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background .2s ease, border-color .2s ease, transform .2s ease;
  }
  .cta-btn-secondary:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.25);
    transform: translateY(-2px);
  }

  /* ── Layout ── */
  .cta-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 64px;
  }
  .cta-left  { flex: 1; min-width: 0; }
  .cta-right { flex-shrink: 0; width: 340px; }

  /* ── Responsive ── */
  .cta-heading { font-size: 52px; }

  @media (max-width: 1100px) {
    .cta-heading { font-size: 44px !important; }
    .cta-right   { width: 300px; }
    .cta-inner   { gap: 40px; }
  }
  @media (max-width: 900px) {
    .cta-inner   { flex-direction: column; gap: 40px; }
    .cta-right   { width: 100%; max-width: 400px; }
    .cta-heading { font-size: 40px !important; }
    .cta-left    { text-align: center; }
    .cta-pills   { justify-content: center !important; }
    .cta-badge   { left: 50% !important; right: auto !important; transform: translateX(-50%) !important; }
  }
  @media (max-width: 640px) {
    .cta-heading { font-size: 32px !important; line-height: 1.15 !important; }
    .cta-section { padding: 60px 0 !important; }
    .cta-pills   { flex-wrap: wrap; gap: 8px !important; }
  }
  @media (max-width: 480px) {
    .cta-heading { font-size: 28px !important; }
  }
`;

const TRUST_PILLS = [
    { icon: BadgeCheck, label: "✓ CompTIA Authorized" },
    { icon: BadgeCheck, label: "✓ Industry Recognized Certs" },
    { icon: Clock, label: "✓ Learn at Your Own Pace" },
];

export default function CTABanner() {
    return (
        <>
            <style>{CSS}</style>

            <section
                className="cta-section"
                aria-label="Start your IT career with Certezy"
                style={{
                    background: "#0B1120",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "80px 0 90px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
            >
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                    {/* ── Panel ── */}
                    <div
                        style={{
                            borderRadius: "28px",
                            padding: "64px 60px",
                            background: "linear-gradient(135deg, #0F172A 0%, #0D1F35 100%)",
                            border: "1px solid rgba(50,130,184,0.15)",
                            boxShadow: "0 0 80px rgba(50,130,184,0.07), inset 0 0 60px rgba(50,130,184,0.04)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Decorative circle */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                right: "-80px",
                                top: "-80px",
                                width: "420px",
                                height: "420px",
                                borderRadius: "50%",
                                border: "1px solid rgba(50,130,184,0.06)",
                                pointerEvents: "none",
                            }}
                        />
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                right: "-40px",
                                top: "-40px",
                                width: "280px",
                                height: "280px",
                                borderRadius: "50%",
                                border: "1px solid rgba(50,130,184,0.08)",
                                pointerEvents: "none",
                            }}
                        />

                        {/* CompTIA badge — top right */}
                        <div
                            className="cta-badge"
                            style={{
                                position: "absolute",
                                top: "24px",
                                right: "24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 16px",
                                borderRadius: "14px",
                                background: "rgba(255,255,255,0.06)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "9px",
                                    background: "rgba(50,130,184,0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <ShieldCheck size={17} color="#3282B8" aria-hidden="true" />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: "9.5px",
                                        fontWeight: 700,
                                        color: "#64748B",
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Certified Partner
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#F1F5F9" }}>
                                    CompTIA Authorized
                                </div>
                            </div>
                        </div>

                        {/* ── Inner row ── */}
                        <div className="cta-inner">
                            {/* LEFT */}
                            <div className="cta-left">
                                <p
                                    className="cta-f0"
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        color: "#3282B8",
                                        marginBottom: "16px",
                                    }}
                                >
                                    Start Today
                                </p>

                                <h2
                                    className="cta-heading cta-f1"
                                    style={{
                                        fontWeight: 900,
                                        lineHeight: 1.08,
                                        letterSpacing: "-0.03em",
                                        color: "#F1F5F9",
                                        marginBottom: "20px",
                                    }}
                                >
                                    Ready to Launch Your
                                    <br />
                                    IT Career?
                                </h2>

                                <p
                                    className="cta-f2"
                                    style={{
                                        fontSize: "16px",
                                        color: "#64748B",
                                        lineHeight: 1.7,
                                        marginBottom: "28px",
                                        maxWidth: "500px",
                                    }}
                                >
                                    Join 10,000+ professionals already learning with Certezy. Get certified,
                                    get hired with the world's most comprehensive enterprise LMS.
                                </p>

                                {/* Trust pills */}
                                <div
                                    className="cta-pills cta-f3"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {TRUST_PILLS.map(({ icon: Icon, label }) => (
                                        <span key={label} className="cta-pill">
                                            <Icon size={13} color="#3282B8" aria-hidden="true" />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="cta-right cta-f2">
                                {/* Primary button */}
                                <Link
                                    to="/register"
                                    className="cta-btn-primary"
                                    aria-label="Get started free with Certezy"
                                    style={{ marginBottom: "12px" }}
                                >
                                    Get Started Free <ArrowRight size={18} aria-hidden="true" />
                                </Link>

                                {/* Secondary button */}
                                <Link
                                    to="/courses"
                                    className="cta-btn-secondary"
                                    aria-label="Browse all certification courses"
                                >
                                    Browse All Courses
                                </Link>

                                {/* Fine print */}
                                <p
                                    style={{
                                        textAlign: "center",
                                        marginTop: "14px",
                                        fontSize: "12px",
                                        color: "#475569",
                                        fontWeight: 500,
                                    }}
                                >
                                    · No credit card required &nbsp;·&nbsp; Cancel anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
