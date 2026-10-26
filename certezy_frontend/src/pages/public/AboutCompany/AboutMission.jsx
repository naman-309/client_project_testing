import { CheckCircle } from "lucide-react";

export default function AboutMission() {
    return (
        <section className="bg-white py-20">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* LEFT CONTENT */}
                    <div>
                        {/* accent line */}
                        <div className="w-14 h-[4px] bg-gradient-to-r from-[#3282B8] to-[#7C3AED] mb-6 rounded-full"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                            Making Certifications Accessible
                            <br />
                            to Everyone
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-8 max-w-[600px]">
                            At Certezy, we believe that high-quality career advancement shouldn't be gated by
                            geography or circumstance. Our platform bridges the gap between ambition and
                            professional achievement by providing direct access to world-class certification
                            programs and industry-driven learning paths.
                        </p>

                        {/* bullet list */}
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <CheckCircle size={20} className="text-[#3282B8] mt-1" />
                                <p className="text-gray-700">
                                    Curriculum aligned with official vendor blueprints.
                                </p>
                            </div>

                            <div className="flex gap-3 items-start">
                                <CheckCircle size={20} className="text-[#3282B8] mt-1" />
                                <p className="text-gray-700">
                                    Hands-on virtual labs for real-world application.
                                </p>
                            </div>

                            <div className="flex gap-3 items-start">
                                <CheckCircle size={20} className="text-[#3282B8] mt-1" />
                                <p className="text-gray-700">Continuous updates to match industry shifts.</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT VISUAL CARD */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-xl h-[380px] flex items-center justify-center bg-gradient-to-br from-[#3282B8] via-[#4F8DFF] to-[#7C3AED]">
                            {/* glow effect */}
                            <div className="absolute w-40 h-40 bg-white/20 blur-3xl rounded-full top-10 left-10"></div>

                            {/* second glow */}
                            <div className="absolute w-32 h-32 bg-white/10 blur-3xl rounded-full bottom-10 right-10"></div>

                            {/* pattern overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#ffffff_1px,_transparent_1px)] [background-size:22px_22px]"></div>

                            {/* quote text */}
                            <p className="text-white text-lg font-medium max-w-[280px] text-center relative z-10 leading-relaxed px-6">
                                “Building the future of digital credentials, one professional at a time.”
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
