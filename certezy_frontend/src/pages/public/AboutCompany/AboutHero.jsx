export default function AboutHero() {
    return (
        <section className="relative bg-[#0a1628] text-white overflow-hidden">
            {/* Dot grid background */}
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_#ffffff_1px,_transparent_1px)] [background-size:28px_28px]" />

            <div className="relative max-w-[1440px] mx-auto px-6 py-24 md:py-32">
                <div className="text-center max-w-[950px] mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center border border-[#3282B8]/40 text-[#3282B8] px-5 py-2 rounded-full text-sm font-medium mb-6">
                        ABOUT CERTEZY
                    </div>

                    {/* Heading */}
                    <h1 className="font-bold leading-tight text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                        Empowering Careers <br />
                        <span className="bg-gradient-to-r from-[#3282B8] via-[#4F8DFF] to-[#7C3AED] bg-clip-text text-transparent">
                            Through Certified Learning
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-[700px] mx-auto leading-relaxed">
                        We help professionals worldwide earn industry-recognized certifications and advance
                        their careers with confidence through curated digital education.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-5 mt-12">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-full hover:border-[#3282B8] hover:bg-white/10 transition">
                            <span className="text-2xl font-bold">500+</span>

                            <span className="text-gray-400 text-sm">Premium Courses</span>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-full hover:border-[#3282B8] hover:bg-white/10 transition">
                            <span className="text-2xl font-bold">50k+</span>

                            <span className="text-gray-400 text-sm">Global Students</span>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-full hover:border-[#3282B8] hover:bg-white/10 transition">
                            <span className="text-2xl font-bold">98%</span>

                            <span className="text-gray-400 text-sm">Pass Rate</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
