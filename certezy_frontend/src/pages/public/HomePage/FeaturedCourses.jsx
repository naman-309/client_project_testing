import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cloud, Shield, Database, Lock, Code, Brain } from "lucide-react";
import courseService from "@/services/courseService";

const customStyles = `
@keyframes slideInFromLeft {
  0% { opacity:0; transform: translateX(-50px) scale(.95); }
  100% { opacity:1; transform: translateX(0) scale(1); }
}

@keyframes autoScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

.auto-scroll-container{
  animation: autoScroll 30s linear infinite;
}

.auto-scroll-container.paused{
  animation-play-state: paused;
}

.tech-card-hover{
  transition: all .3s ease;
}

.tech-card-hover:hover{
  transform: translateY(-8px) scale(1.02);
}
`;

export default function FeaturedCourses() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // FIXED STATES
    const [isPaused, setIsPaused] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await courseService.getAll();
                const coursesData = response?.data?.data || [];

                const uniqueCategories = [...new Set(coursesData.map((c) => c.category_name))];

                const categoryObjects = uniqueCategories.map((name) => ({
                    id: name.toLowerCase().replace(/\s+/g, ""),
                    title: name,
                    description: `Explore ${name} courses`,
                    courses: coursesData.filter((c) => c.category_name === name).length,
                }));

                setCategories(categoryObjects);
            } catch (err) {
                console.error("Category fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // FIXED HOVER HANDLERS
    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    return (
        <section className="bg-[#0B1120] py-24 text-white">
            <style>{customStyles}</style>

            <div className="max-w-[1400px] mx-auto px-6">
                {loading ? (
                    <div className="flex gap-6">
                        {Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[320px] h-[250px] bg-gray-700 rounded-xl animate-pulse"
                                />
                            ))}
                    </div>
                ) : (
                    <div className="overflow-x-hidden">
                        <div
                            className={`flex gap-6 auto-scroll-container ${isPaused ? "paused" : ""}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden tech-card-hover flex flex-col w-[320px] flex-shrink-0 ${
                                        selectedCategory === category.id ? "ring-2 ring-[#3282B8]" : ""
                                    }`}
                                    style={{
                                        animation: `slideInFromLeft .6s ease ${index * 0.1}s both`,
                                    }}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <div className="h-[160px] bg-gradient-to-br from-[#3282B8] to-[#1A5F8A] flex items-center justify-center">
                                        <span className="text-sm font-bold">{category.courses} Courses</span>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-lg mb-2">{category.title}</h3>

                                        <p className="text-gray-400 text-sm mb-4">{category.description}</p>

                                        <Link
                                            to={`/courses?category=${category.id}`}
                                            className="mt-auto text-center py-3 rounded-lg bg-[#007bff] hover:bg-[#0069d9] text-white font-medium transition"
                                        >
                                            Explore All Courses
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center mt-14">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 hover:border-[#3282B8] transition"
                    >
                        View All Courses
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
