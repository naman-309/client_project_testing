// WhyCertezy.jsx
import { BadgeCheck, Clock, GraduationCap, CreditCard, Award, Briefcase } from "lucide-react";

const CSS = `
  @keyframes wcFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .wc-f0 { animation: wcFadeUp .5s .00s ease both; }
  .wc-f1 { animation: wcFadeUp .5s .06s ease both; }
  .wc-f2 { animation: wcFadeUp .5s .12s ease both; }
  .wc-f3 { animation: wcFadeUp .5s .18s ease both; }
  .wc-f4 { animation: wcFadeUp .5s .24s ease both; }
  .wc-f5 { animation: wcFadeUp .5s .30s ease both; }

  .wc-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 32px 28px;
    border: 1px solid #E8EEF4;
    position: relative;
    overflow: hidden;
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
    /* elevation — NOT flat */
    box-shadow:
      0 1px 3px rgba(15,23,42,0.04),
      0 4px 16px rgba(15,23,42,0.06),
      0 12px 32px rgba(15,23,42,0.05);
  }
  .wc-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3282B8, #6C3BD5);
    opacity: 0;
    transition: opacity .25s ease;
    border-radius: 20px 20px 0 0;
  }
  .wc-card:hover {
    transform: translateY(-6px);
    border-color: rgba(50,130,184,0.2);
    box-shadow:
      0 2px 6px rgba(15,23,42,0.05),
      0 8px 28px rgba(50,130,184,0.12),
      0 24px 56px rgba(50,130,184,0.08);
  }
  .wc-card:hover::before { opacity: 1; }

  .wc-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    transition: transform .25s ease;
  }
  .wc-card:hover .wc-icon-wrap { transform: scale(1.08); }
`;

const FEATURES = [
    {
        icon: BadgeCheck,
        iconBg: "bg-blue-50",
        iconColor: "#3282B8",
        title: "Industry Certifications",
        desc: "Direct preparation for the most in-demand exams in Tech, Cloud, and Management.",
        cls: "wc-f0",
    },
    {
        icon: Clock,
        iconBg: "bg-purple-50",
        iconColor: "#6C3BD5",
        title: "Learn at Your Pace",
        desc: "Flexible schedules that fit into a busy professional life without compromising quality.",
        cls: "wc-f1",
    },
    {
        icon: GraduationCap,
        iconBg: "bg-blue-50",
        iconColor: "#3282B8",
        title: "Expert Instructors",
        desc: "Learn from verified experts who have held these certifications for decades.",
        cls: "wc-f2",
    },
    {
        icon: CreditCard,
        iconBg: "bg-purple-50",
        iconColor: "#6C3BD5",
        title: "Affordable Pricing",
        desc: "Premium education at a fraction of the cost of traditional in-person bootcamps.",
        cls: "wc-f3",
    },
    {
        icon: Award,
        iconBg: "bg-blue-50",
        iconColor: "#3282B8",
        title: "Verified Certificates",
        desc: "Shareable, blockchain-verified certificates that recruiters can trust instantly.",
        cls: "wc-f4",
    },
    {
        icon: Briefcase,
        iconBg: "bg-purple-50",
        iconColor: "#6C3BD5",
        title: "Job-Ready Skills",
        desc: "Beyond theory — we focus on the practical skills needed to hit the ground running.",
        cls: "wc-f5",
    },
];

export default function WhyCertezy() {
    return (
        <>
            <style>{CSS}</style>

            <section
                aria-label="Why thousands choose Certezy"
                className="bg-[#F8FAFC] py-24"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-14 wc-f0">
                        <h2 className="text-[#0F172A] font-black text-4xl lg:text-5xl tracking-tight leading-tight mb-4">
                            Why Thousands Choose{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #3282B8, #6C3BD5)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Certezy
                            </span>
                        </h2>
                        <p className="text-[#64748B] text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
                            We've refined our learning experience to ensure every student doesn't just learn,
                            but masters their craft.
                        </p>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, desc, cls }) => (
                            <article key={title} className={`wc-card ${cls}`}>
                                {/* Icon */}
                                <div className={`wc-icon-wrap ${iconBg}`}>
                                    <Icon size={24} color={iconColor} strokeWidth={1.8} aria-hidden="true" />
                                </div>

                                {/* Title */}
                                <h3 className="text-[#0F172A] font-bold text-[16.5px] mb-3 leading-snug">
                                    {title}
                                </h3>

                                {/* Desc */}
                                <p className="text-[#64748B] text-[13.5px] leading-relaxed">{desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
