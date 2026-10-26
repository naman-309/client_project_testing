import { GraduationCap, Video, Headphones, Globe, ShieldCheck } from "lucide-react";

const CSS = `
  @keyframes countUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .ls-fade { animation: countUp .5s ease both; }
  .ls-fade-1 { animation: countUp .5s .05s ease both; }
  .ls-fade-2 { animation: countUp .5s .10s ease both; }
  .ls-fade-3 { animation: countUp .5s .15s ease both; }

  .ls-stat-card {
    background: #0F172A;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
    transition: border-color .2s ease, transform .2s ease;
  }
  .ls-stat-card:hover {
    border-color: rgba(50,130,184,0.35);
    transform: translateY(-3px);
  }

  .ls-feature-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(50,130,184,0.12);
    border: 1px solid rgba(50,130,184,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background .2s ease;
  }
  .ls-feature:hover .ls-feature-icon {
    background: rgba(50,130,184,0.22);
  }

  .ls-logo-pill {
    padding: 7px 18px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    font-size: 12.5px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.04em;
    transition: border-color .2s ease, color .2s ease;
  }
  .ls-logo-pill:hover {
    border-color: rgba(50,130,184,0.4);
    color: #CBD5E1;
  }

  /* ── Responsive ── */
  .ls-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .ls-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .ls-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    margin-top: 36px;
  }

  @media (max-width: 1024px) {
    .ls-grid { gap: 36px; }
    .ls-heading { font-size: 36px !important; }
  }
  @media (max-width: 900px) {
    .ls-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .ls-heading { font-size: 34px !important; }
  }
  @media (max-width: 640px) {
    .ls-features-grid { grid-template-columns: 1fr; gap: 20px; }
    .ls-heading { font-size: 30px !important; }
    .ls-section { padding: 56px 0 !important; }
  }
  @media (max-width: 480px) {
    .ls-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .ls-stat-card  { padding: 18px 16px; }
    .ls-heading    { font-size: 27px !important; }
  }
`;

const STATS = [
    { icon: ShieldCheck, label: "CompTIA", sub: "Authorized Partner", color: true },
    { num: "10K+", label: "Active", sub: "Learners", color: false },
    { num: "50+", label: "Programs", sub: "Certifications", color: false },
    { num: "98%", label: "Success", sub: "Rate", color: false },
];

const FEATURES = [
    {
        icon: GraduationCap,
        title: "Best Industry Instructors",
        desc: "Learn from certified professionals at top global tech companies.",
    },
    {
        icon: Video,
        title: "Live Interactive Classes",
        desc: "Real-time classes with live Q&A and hands-on labs.",
    },
    {
        icon: Headphones,
        title: "1-to-1 Student Support",
        desc: "Personalized mentoring and career guidance at every step.",
    },
    {
        icon: Globe,
        title: "Global Certifications",
        desc: "Credentials recognized by leading IT organizations worldwide.",
    },
];

const LOGOS = ["CompTIA", "AWS", "Microsoft", "Cisco"];

export default function LearningSection() {
    return (
        <>
            <style>{CSS}</style>

            <section
                aria-label="Why learn with Certezy"
                className="ls-section relative text-white"
                style={{
                    background: "#071B2F",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "80px 0",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
            >
                {/* Subtle top glow */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "600px",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(50,130,184,0.4), transparent)",
                        pointerEvents: "none",
                    }}
                />

                <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 24px" }}>
                    {/* ── Trusted logos ── */}
                    <div style={{ textAlign: "center", marginBottom: "56px" }}>
                        <p
                            style={{
                                fontSize: "10.5px",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                color: "#475569",
                                textTransform: "uppercase",
                                marginBottom: "20px",
                            }}
                        >
                            Trusted by Global Industry Leaders
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            {LOGOS.map((logo) => (
                                <span key={logo} className="ls-logo-pill">
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Main grid ── */}
                    <div className="ls-grid">
                        {/* LEFT — stats */}
                        <div className="ls-stats-grid">
                            {STATS.map(({ icon: Icon, num, label, sub }, i) => (
                                <div key={label} className={`ls-stat-card ls-fade-${i}`}>
                                    {Icon ? (
                                        <>
                                            <ShieldCheck
                                                size={26}
                                                color="#3282B8"
                                                style={{ marginBottom: "14px" }}
                                                aria-hidden="true"
                                            />
                                            <div
                                                style={{
                                                    fontSize: "20px",
                                                    fontWeight: 800,
                                                    color: "#fff",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#64748B",
                                                    marginTop: "5px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {sub}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    fontSize: "32px",
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: "#3282B8",
                                                    marginBottom: "8px",
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                }}
                                            >
                                                {num}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    color: "#F1F5F9",
                                                }}
                                            >
                                                {label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "11.5px",
                                                    color: "#64748B",
                                                    marginTop: "3px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {sub}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* RIGHT — heading + features */}
                        <div>
                            <h2
                                className="ls-heading ls-fade"
                                style={{
                                    fontSize: "42px",
                                    fontWeight: 900,
                                    lineHeight: 1.15,
                                    letterSpacing: "-0.025em",
                                    color: "#F1F5F9",
                                    marginBottom: "16px",
                                }}
                            >
                                You Can Learn Anything, <span style={{ color: "#3282B8" }}>Anytime</span> From
                                Anywhere
                            </h2>

                            <p
                                style={{
                                    fontSize: "15.5px",
                                    color: "#64748B",
                                    lineHeight: 1.7,
                                    maxWidth: "440px",
                                }}
                            >
                                World-class IT training combined with flexible learning — built for real
                                career outcomes.
                            </p>

                            {/* Features */}
                            <div className="ls-features-grid">
                                {FEATURES.map(({ icon: Icon, title, desc }) => (
                                    <div
                                        key={title}
                                        className="ls-feature"
                                        style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}
                                    >
                                        <div className="ls-feature-icon" aria-hidden="true">
                                            <Icon size={20} color="#3282B8" />
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    color: "#F1F5F9",
                                                    marginBottom: "5px",
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {title}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: "12.5px",
                                                    color: "#64748B",
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
