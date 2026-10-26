// CertificationsMarquee.jsx

const CSS = `
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 22s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }
  .marquee-wrap {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
  }
`;

const CERTS = [
    "AWS",
    "Microsoft Azure",
    "CompTIA",
    "Google Cloud",
    "CISCO",
    "PMP",
    "ITIL",
    "Azure DevOps",
    "Kubernetes",
    "Terraform",
];

export default function CertificationsMarquee() {
    // Duplicate for seamless loop
    const items = [...CERTS, ...CERTS];

    return (
        <>
            <style>{CSS}</style>

            <section
                aria-label="Certifications we prepare you for"
                className="bg-[#F8FAFC] border-t border-b border-slate-200 py-14"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* Label */}
                <p className="text-center text-[11px] font-bold tracking-[0.16em] text-[#64748B] uppercase mb-10">
                    Certifications We Prepare You For
                </p>

                {/* Marquee */}
                <div className="marquee-wrap">
                    <div className="marquee-track">
                        {items.map((cert, i) => (
                            <span
                                key={i}
                                className="px-10 text-[#94A3B8] font-bold text-lg lg:text-xl hover:text-[#3282B8] transition-colors duration-200 cursor-default select-none whitespace-nowrap"
                            >
                                {cert}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
