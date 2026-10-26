import { Rocket, Code2, Briefcase, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";

export default function WhyChooseSection() {
    const features = [
        {
            icon: Rocket,
            title: "Live Projects",
            desc: "Work on real-world scenarios to build practical experience that employers actually value.",
        },
        {
            icon: Code2,
            title: "Industry Curriculum",
            desc: "Stay ahead with courses meticulously updated by industry experts and tech leads.",
        },
        {
            icon: Briefcase,
            title: "Placement Assistance",
            desc: "Get dedicated support to land your dream IT job with resume reviews and mock interviews.",
        },
        {
            icon: InfinityIcon,
            title: "Lifetime Access",
            desc: "Learn at your own pace with unlimited access to your courses. Your knowledge base, forever.",
        },
        {
            icon: ShieldCheck,
            title: "Global Certification",
            desc: "Earn industry-recognized certificates to boost your career and prove your expertise worldwide.",
        },
    ];

    return (
        <section className="relative py-24 bg-[#020617] text-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                    <span className="text-xs tracking-widest border border-blue-400/30 text-blue-300 px-5 py-2 rounded-full bg-blue-500/10">
                        THE CERTEZY ADVANTAGE
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-center font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
                    Why Choose <span className="text-blue-400">Certezy?</span>
                </h2>

                <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16">
                    We provide industry-leading IT certification training with a focus on real-world skills
                    and career growth.
                </p>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <FeatureCard feature={features[0]} />
                    <FeatureCard feature={features[1]} />
                    <FeatureCard feature={features[2]} />

                    <FeatureCard feature={features[3]} />

                    {/* Center glowing circle design */}
                    <div className="hidden xl:flex items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a] relative overflow-hidden">
                        {/* glow background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>

                        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-xl opacity-40 animate-pulse"></div>

                            <div className="absolute inset-0 border border-blue-400/20 rounded-full"></div>
                            <div className="absolute inset-6 border border-blue-400/20 rounded-full"></div>
                            <div className="absolute inset-12 border border-blue-400/20 rounded-full"></div>
                            <div className="absolute inset-20 border border-blue-400/20 rounded-full"></div>
                        </div>
                    </div>

                    <FeatureCard feature={features[4]} />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ feature }) {
    const Icon = feature.icon;

    return (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 transition duration-300 hover:scale-[1.03] hover:border-blue-500/40 hover:shadow-xl">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500/10 mb-6">
                <Icon size={22} className="text-blue-400" />
            </div>

            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>
    );
}
