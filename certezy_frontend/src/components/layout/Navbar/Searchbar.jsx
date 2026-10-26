import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, BookOpen, X, TrendingUp, ArrowUpRight } from "lucide-react";
import courseService from "@/services/courseService";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

// Trending — apne platform ke popular searches se replace karna
const TRENDING = [
    { label: "AWS Solutions Architect", icon: "☁️" },
    { label: "CompTIA Security+", icon: "🔐" },
    { label: "Docker & Kubernetes", icon: "⚙️" },
    { label: "Python for Data Science", icon: "📊" },
    { label: "PMP Certification", icon: "📋" },
];

export default function SearchBar({ className }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    const navigate = useNavigate();
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const debouncedQuery = useDebounce(query, 400);

    // ── Fetch results ──────────────────────────────────────
    useEffect(() => {
        if (debouncedQuery.trim().length < 3) {
            setResults([]);
            setDropOpen(focused);
            return;
        }
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await courseService.getAll({
                    search: debouncedQuery.trim(),
                    limit: 6,
                    status: "published",
                });
                setResults(data.data || []);
                setDropOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [debouncedQuery]);

    // ── Outside click — close ──────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setDropOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Escape — close ─────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") {
                setDropOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const handleCourseClick = (slug) => {
        setDropOpen(false);
        setQuery("");
        navigate(`/courses/${slug}`);
    };
    const handleTrendingClick = (label) => {
        setQuery(label);
        inputRef.current?.focus();
    };
    const handleViewAll = () => {
        setDropOpen(false);
        navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
        setQuery("");
    };
    const handleClear = () => {
        setQuery("");
        setResults([]);
        setDropOpen(true);
        inputRef.current?.focus();
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim().length < 3) return;
        handleViewAll();
    };

    const showTrending = dropOpen && query.trim().length < 3;
    const showResults = dropOpen && query.trim().length >= 3;

    return (
        <div ref={containerRef} className={cn("relative flex-1", className)}>
            {/* ── Input ─────────────────────────────────────── */}
            <form onSubmit={handleSubmit}>
                <div
                    className={cn(
                        "flex items-center gap-2 h-[36px] px-3.5",
                        "bg-[#F5F7FA] border border-transparent rounded-full",
                        "transition-all duration-200",
                        focused && "bg-white border-primary shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                    )}
                >
                    {loading ? (
                        <Loader2 size={14} className="shrink-0 text-primary animate-spin" />
                    ) : (
                        <Search
                            size={14}
                            className={cn(
                                "shrink-0 transition-colors duration-200",
                                focused ? "text-primary" : "text-text-muted"
                            )}
                        />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            setFocused(true);
                            setDropOpen(true);
                        }}
                        onBlur={() => setFocused(false)}
                        placeholder="Search courses..."
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] text-text-primary placeholder:text-text-muted"
                    />
                    {query.length > 0 && (
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleClear();
                            }}
                            className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </form>

            {/* ── Dropdown ──────────────────────────────────── */}
            {dropOpen && (
                <div
                    className="absolute top-[calc(100%+18px)] left-0 right-0 bg-white rounded-2xl overflow-hidden z-50"
                    style={{
                        border: "1px solid #E8ECF0",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 40px -8px rgba(0,0,0,0.12)",
                        minWidth: "300px",
                    }}
                >
                    {/* ── TRENDING — jab query empty ho ─────── */}
                    {showTrending && (
                        <>
                            <div className="flex items-center gap-2 px-4 pt-4 pb-2.5">
                                <TrendingUp size={13} className="text-primary" />
                                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                                    Trending Searches
                                </span>
                            </div>

                            {/* Chips */}
                            <div className="px-3 pb-3 flex flex-wrap gap-2">
                                {TRENDING.map((t) => (
                                    <button
                                        key={t.label}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleTrendingClick(t.label);
                                        }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                                            "border border-border bg-page",
                                            "text-[12.5px] font-medium text-text-secondary",
                                            "hover:border-primary hover:text-primary hover:bg-primary-light",
                                            "transition-all duration-150"
                                        )}
                                    >
                                        <span>{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border">
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        navigate("/courses");
                                        setDropOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12.5px] font-semibold text-primary hover:bg-primary-light transition-colors"
                                >
                                    Browse all courses <ArrowUpRight size={13} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── RESULTS ───────────────────────────── */}
                    {showResults && (
                        <>
                            {/* Skeleton loading */}
                            {loading && (
                                <div className="p-3 space-y-1">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-2 py-2.5 animate-pulse"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-border shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-border rounded-full w-3/4" />
                                                <div className="h-2.5 bg-border rounded-full w-1/2" />
                                            </div>
                                            <div className="h-3 bg-border rounded-full w-8 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Results */}
                            {!loading && results.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                                            Results
                                        </span>
                                        <span className="text-[11px] text-text-muted">
                                            {results.length} found
                                        </span>
                                    </div>

                                    {results.slice(0, 5).map((course) => (
                                        <button
                                            key={course.id}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleCourseClick(course.slug);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8FAFF] transition-colors border-b border-border/60 last:border-0"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-primary-light shrink-0 flex items-center justify-center">
                                                <BookOpen size={14} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-text-primary truncate">
                                                    {course.title}
                                                </p>
                                                <p className="text-[11.5px] text-text-muted mt-0.5 flex items-center gap-1.5">
                                                    {course.category_name}
                                                    {course.level && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-page text-[10.5px] font-semibold capitalize border border-border">
                                                            {course.level}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-[13px] font-bold text-primary shrink-0">
                                                ${course.price}
                                            </span>
                                        </button>
                                    ))}

                                    <div className="border-t border-border">
                                        <button
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleViewAll();
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12.5px] font-semibold text-primary hover:bg-primary-light transition-colors"
                                        >
                                            View all results for "{query}" <ArrowUpRight size={13} />
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* No results */}
                            {!loading && results.length === 0 && (
                                <div className="px-4 py-8 text-center">
                                    <div className="w-10 h-10 rounded-full bg-page flex items-center justify-center mx-auto mb-3">
                                        <Search size={16} className="text-text-muted" />
                                    </div>
                                    <p className="text-[13.5px] font-semibold text-text-primary mb-1">
                                        No results found
                                    </p>
                                    <p className="text-[12px] text-text-muted mb-3">
                                        No courses match "{query}"
                                    </p>
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleViewAll();
                                        }}
                                        className="text-[12.5px] font-semibold text-primary hover:text-primary-hover transition-colors"
                                    >
                                        Browse all courses →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
