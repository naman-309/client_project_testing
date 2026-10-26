import { CheckCircle } from "lucide-react";

export default function SkillsSection() {
    return (
        <section className="bg-[#020617] py-20 lg:py-28 text-white">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    {/* LEFT SIDE - CODE VISUAL */}
                    <div className="relative">
                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">
                            {/* fake code lines */}
                            <div className="space-y-3 font-mono text-sm">
                                <p className="text-blue-400">const cloudEngineer = () =&gt; {"{"}</p>

                                <p className="text-green-400 ml-4">learn("AWS", "Docker", "Kubernetes")</p>

                                <p className="text-yellow-400 ml-4">buildRealWorldProjects()</p>

                                <p className="text-purple-400 ml-4">getCertified("CompTIA")</p>

                                <p className="text-pink-400 ml-4">landDreamJob()</p>

                                <p className="text-blue-400">{"}"}</p>
                            </div>
                        </div>

                        {/* floating stats card */}
                        <div className="absolute -bottom-6 left-6 bg-[#0f172a] border border-white/10 px-6 py-4 rounded-xl flex items-center gap-4 shadow-xl">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                🎓
                            </div>

                            <div>
                                <p className="font-semibold text-lg">12,000+</p>
                                <p className="text-gray-400 text-sm">Certified Learners</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                            Master the Skills of <span className="text-blue-500">Tomorrow</span> Today.
                        </h2>

                        <p className="text-gray-400 mb-8 max-w-xl">
                            Our platform is designed for those who refuse to settle for mediocre. We bridge
                            the gap between academic theory and high-level enterprise execution.
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="flex gap-3">
                                <CheckCircle className="text-blue-500 mt-1" size={20} />
                                <p>Access to exclusive alumni network and job boards.</p>
                            </div>

                            <div className="flex gap-3">
                                <CheckCircle className="text-blue-500 mt-1" size={20} />
                                <p>Direct mentorship from Silicon Valley veterans.</p>
                            </div>

                            <div className="flex gap-3">
                                <CheckCircle className="text-blue-500 mt-1" size={20} />
                                <p>Hands-on lab environments for every technology stack.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button className="bg-gradient-to-r from-blue-500 to-purple-500 px-7 py-3 rounded-lg font-semibold">
                                Start Your Journey
                            </button>

                            <button className="border border-white/10 px-7 py-3 rounded-lg">
                                View Curriculum
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
