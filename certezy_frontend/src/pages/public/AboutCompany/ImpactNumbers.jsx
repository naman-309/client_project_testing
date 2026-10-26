// ImpactNumbers.jsx
const STATS = [
    { value: "50k+", label: "STUDENTS" },
    { value: "500+", label: "COURSES" },
    { value: "120+", label: "COUNTRIES" },
    { value: "95%", label: "SATISFACTION" },
];

export default function ImpactNumbers() {
    return (
        <section
            aria-label="Our impact in numbers"
            className="bg-[#0B1120] border-t border-white/5 py-20"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Heading */}
                <h2 className="text-center text-white font-black text-4xl lg:text-5xl tracking-tight mb-16">
                    Our Impact in Numbers
                </h2>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="flex flex-col items-start gap-2">
                            <span
                                className="text-white font-black leading-none tracking-tight"
                                style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
                            >
                                {value}
                            </span>
                            <span className="text-[#475569] text-xs font-bold tracking-[0.14em]">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
