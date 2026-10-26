// src/pages/contact/ContactHero.jsx

const IconMail = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const IconPhone = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const IconPin = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const infoCards = [
    {
        icon: <IconMail />,
        title: "Email Us",
        sub: "Our team responds within 24 hours.",
        value: "hello@scholareditorial.com",
        href: "mailto:hello@scholareditorial.com",
    },
    {
        icon: <IconPhone />,
        title: "Call Us",
        sub: "Mon – Fri from 9am to 6pm PST.",
        value: "+1 (555) 123–4567",
        href: "tel:+15551234567",
    },
    {
        icon: <IconPin />,
        title: "Visit Us",
        sub: "Our studio in the heart of the city.",
        value: "123 Scholar Plaza, San Francisco, CA",
        href: "#map",
    },
];

export default function ContactHero() {
    return (
        <section
            className="px-6 pt-20 pb-0 md:pt-24"
            style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)" }}
        >
            <div className="max-w-screen-2xl mx-auto">
                {/* ── Hero Text ── */}
                <div className="text-center mb-14 animate-[fadeUp_0.6s_ease_both]">
                    <span
                        className="inline-block text-xs font-bold uppercase tracking-[0.14em] mb-4"
                        style={{ color: "#3282B8" }}
                    >
                        Get in Touch
                    </span>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 leading-tight mb-4">
                        Get in <span style={{ color: "#3282B8" }}>Touch</span>
                    </h1>

                    <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                        We're here to help you on your educational journey. Reach out for technical support,
                        partnership inquiries, or general questions.
                    </p>
                </div>

                {/* ── Info Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {infoCards.map((card, i) => (
                        <div
                            key={card.title}
                            className="
                rounded-2xl p-7
                text-center
                border border-white/[0.08] bg-white/[0.04]
                hover:border-[#3282B8]/40 hover:bg-[#3282B8]/[0.07]
                hover:-translate-y-1
                transition-all duration-250
                group
                /* mobile: horizontal */
                flex flex-col items-center
                md:flex md:flex-col md:items-center
                max-md:flex-row max-md:text-left max-md:gap-4 max-md:p-5
              "
                            style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                        >
                            {/* Icon */}
                            <div
                                className="
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  mb-4 max-md:mb-0
                "
                                style={{
                                    background: "rgba(50,130,184,0.15)",
                                    border: "1px solid rgba(50,130,184,0.25)",
                                    color: "#ffffff",
                                }}
                            >
                                {card.icon}
                            </div>

                            {/* Body */}
                            <div className="flex flex-col max-md:flex-1">
                                <p className="text-sm font-bold text-white mb-1">{card.title}</p>
                                <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">{card.sub}</p>
                                <a
                                    href={card.href}
                                    className="text-sm font-semibold text-white transition-colors duration-200 hover:opacity-70"
                                >
                                    {card.value}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* fadeUp keyframe — one-time inject */}
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </section>
    );
}
