import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";

import {
    fetchCourses,
    setFilter,
    setPage,
    selectCourses,
    selectPagination,
    selectFilters,
    selectCoursesLoading,
    selectCoursesError,
} from "@/features/course/courseSlice";

import categoryService from "@/services/categoryService";
import CourseCard from "./CourseCard";
import CourseFilters from "./CourseFilters";
import CourseSortBar from "./CourseSortBar";
import { CourseCardSkeleton } from "@/components/shared/Skeleton";
import { cn } from "@/lib/utils";

// TODO: backend ready hone pe GET /api/v1/stats se replace karo
const TRENDING_TAGS = ["AWS", "Security+", "Docker", "PMP", "Azure", "Python"];

export default function CoursesPage() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const courses = useSelector(selectCourses);
    const pagination = useSelector(selectPagination);
    const filters = useSelector(selectFilters);
    const loading = useSelector(selectCoursesLoading);
    const error = useSelector(selectCoursesError);

    const [categories, setCategories] = useState([]);
    const [heroSearch, setHeroSearch] = useState("");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // ── Sync URL → Redux ───────────────────────────────────
    useEffect(() => {
        const category_id = searchParams.get("category_id");
        const search = searchParams.get("search");
        const level = searchParams.get("level");
        if (category_id) dispatch(setFilter({ key: "category_id", value: Number(category_id) }));
        if (search) dispatch(setFilter({ key: "search", value: search }));
        if (level) dispatch(setFilter({ key: "level", value: level }));
    }, []);

    // ── Fetch categories ───────────────────────────────────
    useEffect(() => {
        categoryService
            .getAll()
            .then(({ data }) => setCategories(data.data.categories))
            .catch(() => {});
    }, []);

    // ── Fetch courses ──────────────────────────────────────
    useEffect(() => {
        const params = { page: pagination.page, limit: pagination.limit };
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.level) params.level = filters.level;
        if (filters.search) params.search = filters.search;
        if (filters.sort) params.sort = filters.sort;
        dispatch(fetchCourses(params));
    }, [filters.category_id, filters.level, filters.search, filters.sort, pagination.page]);

    // ── Hero search submit ─────────────────────────────────
    const handleHeroSearch = (e) => {
        e.preventDefault();
        if (!heroSearch.trim()) return;
        dispatch(setFilter({ key: "search", value: heroSearch.trim() }));
        setHeroSearch("");
        document.getElementById("courses-section")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleTrendingClick = (tag) => {
        dispatch(setFilter({ key: "search", value: tag }));
        document.getElementById("courses-section")?.scrollIntoView({ behavior: "smooth" });
    };

    // ── Lock body when drawer open ─────────────────────────
    useEffect(() => {
        document.body.style.overflow = mobileFilterOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileFilterOpen]);

    const activeFilterCount = [filters.category_id, filters.level].filter(Boolean).length;

    // Real courses count from Redux
    const coursesCount = pagination.total ? `${pagination.total.toLocaleString()}+` : null;

    return (
        <div className="min-h-screen" style={{ background: "#F1F5F9" }}>
            {/* ══════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════ */}
            <div
                style={{
                    background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Dot grid — depth */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.04,
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "26px 26px",
                        pointerEvents: "none",
                    }}
                />

                {/* Glow top right */}
                <div
                    style={{
                        position: "absolute",
                        top: "-80px",
                        right: "5%",
                        width: "380px",
                        height: "380px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(96,165,250,0.09) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-14 lg:py-20 relative">
                    <div style={{ maxWidth: "580px" }}>
                        {/* Badge — sirf real count dikhao */}
                        {coursesCount && (
                            <div
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                                style={{
                                    background: "rgba(255,255,255,0.07)",
                                    border: "1px solid rgba(255,255,255,0.11)",
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.65)",
                                    }}
                                >
                                    {coursesCount} courses available
                                </span>
                            </div>
                        )}

                        {/* Heading */}
                        <h1
                            style={{
                                fontSize: "clamp(26px, 3.5vw, 40px)",
                                fontWeight: 800,
                                color: "#ffffff",
                                lineHeight: 1.18,
                                letterSpacing: "-0.025em",
                                marginBottom: "6px",
                            }}
                        >
                            Master the Art of
                        </h1>
                        <h1
                            style={{
                                fontSize: "clamp(26px, 3.5vw, 40px)",
                                fontWeight: 800,
                                color: "#60A5FA",
                                lineHeight: 1.18,
                                letterSpacing: "-0.025em",
                                marginBottom: "18px",
                            }}
                        >
                            Certification Success.
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontSize: "15px",
                                fontWeight: 400,
                                color: "rgba(255,255,255,0.50)",
                                lineHeight: 1.7,
                                marginBottom: "32px",
                            }}
                        >
                            Industry-recognized certification courses taught by experts. Advance your career
                            with confidence.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleHeroSearch}>
                            <div
                                className="flex items-center bg-white"
                                style={{
                                    borderRadius: "14px",
                                    boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
                                    overflow: "hidden",
                                    maxWidth: "520px",
                                }}
                            >
                                <div className="flex items-center gap-3 flex-1 px-4">
                                    <Search size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
                                    <input
                                        type="text"
                                        value={heroSearch}
                                        onChange={(e) => setHeroSearch(e.target.value)}
                                        placeholder="What do you want to learn?"
                                        style={{
                                            flex: 1,
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            padding: "14px 0",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: "#0F172A",
                                        }}
                                    />
                                </div>
                                <div style={{ padding: "6px 6px 6px 0" }}>
                                    <button
                                        type="submit"
                                        style={{
                                            height: "40px",
                                            padding: "0 22px",
                                            background: "#3282B8",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            transition: "background 0.15s",
                                            whiteSpace: "nowrap",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a6fa0")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3282B8")}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Trending tags */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <span
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    color: "rgba(255,255,255,0.36)",
                                    flexShrink: 0,
                                }}
                            >
                                Trending:
                            </span>
                            {TRENDING_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTrendingClick(tag)}
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "rgba(255,255,255,0.58)",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                                        e.currentTarget.style.color = "#fff";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.26)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                        e.currentTarget.style.color = "rgba(255,255,255,0.58)";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                COURSES SECTION
            ══════════════════════════════════════════════ */}
            <div id="courses-section" className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Active search pill */}
                {filters.search && (
                    <div className="mb-4 flex items-center gap-2">
                        <span style={{ fontSize: "13px", color: "#64748B" }}>Results for</span>
                        <span
                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full"
                            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                        >
                            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#2563EB" }}>
                                {filters.search}
                            </span>
                            <button
                                onClick={() => dispatch(setFilter({ key: "search", value: null }))}
                                className="w-4 h-4 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: "rgba(37,99,235,0.10)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = "rgba(37,99,235,0.22)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "rgba(37,99,235,0.10)")
                                }
                            >
                                <X size={10} style={{ color: "#2563EB" }} />
                            </button>
                        </span>
                    </div>
                )}

                {/* Mobile filter button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13.5px] font-semibold transition-all",
                            activeFilterCount > 0
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-border text-text-primary hover:border-primary hover:text-primary"
                        )}
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Main layout */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                    {/* Sidebar — desktop only */}
                    <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
                        <CourseFilters categories={categories} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                        <CourseSortBar />

                        {/* Error */}
                        {error && !loading && (
                            <div
                                className="bg-white rounded-xl p-6 sm:p-8 text-center"
                                style={{ border: "1px solid #E8ECF4" }}
                            >
                                <p className="text-[13.5px] text-red-500 mb-2">{error}</p>
                                <button
                                    onClick={() => dispatch(fetchCourses({}))}
                                    className="text-[13px] font-semibold text-primary"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                            {loading
                                ? Array(pagination.limit || 12)
                                      .fill(0)
                                      .map((_, i) => <CourseCardSkeleton key={i} />)
                                : courses.map((course) => <CourseCard key={course.id} course={course} />)}
                        </div>

                        {/* Empty state */}
                        {!loading && !error && courses.length === 0 && (
                            <div
                                className="bg-white rounded-xl p-8 sm:p-12 lg:p-16 text-center"
                                style={{ border: "1px solid #E8ECF4" }}
                            >
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4"
                                    style={{ border: "1px solid #E8ECF4" }}
                                >
                                    <Search size={18} className="sm:text-[22px] text-text-muted" />
                                </div>
                                <p className="text-[14px] sm:text-[15px] font-bold text-text-primary mb-2">
                                    No courses found
                                </p>
                                <p className="text-[12px] sm:text-[13px] text-text-muted mb-4">
                                    Try adjusting your filters or search query
                                </p>
                                <button
                                    onClick={() => dispatch(setFilter({ key: "search", value: null }))}
                                    className="text-[12px] sm:text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
                                >
                                    Clear filters →
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <Pagination
                                pagination={pagination}
                                onPageChange={(p) => {
                                    dispatch(setPage(p));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                MOBILE FILTER DRAWER
            ══════════════════════════════════════════════ */}
            {mobileFilterOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setMobileFilterOpen(false)}
                    />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white lg:hidden"
                        style={{
                            borderRadius: "20px 20px 0 0",
                            maxHeight: "88vh",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
                            animation: "slideUp 0.25s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    >
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-[#CBD5E1]" />
                        </div>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                            <p className="text-[15px] font-bold text-text-primary">Filters</p>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-page transition-colors"
                            >
                                <X size={16} className="text-text-secondary" />
                            </button>
                        </div>
                        <div
                            className="overflow-y-auto px-4 py-2"
                            style={{ maxHeight: "calc(88vh - 130px)" }}
                        >
                            <CourseFilters categories={categories} />
                        </div>
                        <div className="px-5 py-4 border-t border-border">
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-full h-12 rounded-xl bg-primary text-white text-[14px] font-bold hover:bg-primary-hover transition-colors"
                                style={{ boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
                            >
                                {activeFilterCount > 0
                                    ? `Apply ${activeFilterCount} Filter${activeFilterCount > 1 ? "s" : ""}`
                                    : "Apply Filters"}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ── Pagination ─────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
    const { page, totalPages } = pagination;

    const getPages = () => {
        const pages = [];
        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 pt-4">
            <PagBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>
                <ChevronLeft size={15} />
            </PagBtn>
            {getPages().map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={cn(
                        "w-9 h-9 rounded-lg text-[13px] font-semibold transition-all",
                        p === page
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
                    )}
                >
                    {p}
                </button>
            ))}
            <PagBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
                <ChevronRight size={15} />
            </PagBtn>
        </div>
    );
}

function PagBtn({ children, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center border transition-all",
                disabled
                    ? "text-text-muted cursor-not-allowed bg-page border-border"
                    : "bg-white border-border text-text-secondary hover:border-primary hover:text-primary"
            )}
        >
            {children}
        </button>
    );
}
