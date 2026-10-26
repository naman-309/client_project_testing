import { useDispatch, useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { selectFilters, selectPagination, setFilter } from "@/features/course/courseSlice";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Most Popular", value: "popular" },
    { label: "Price: Low", value: "price_low" },
    { label: "Price: High", value: "price_high" },
    { label: "Top Rated", value: "rating" },
];

export default function CourseSortBar() {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);
    const pagination = useSelector(selectPagination);

    const scrollRef = useRef(null);
    const [showFade, setShowFade] = useState(false);

    const { total, page, limit } = pagination;
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const check = () =>
            setShowFade(
                el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 8
            );
        check();
        el.addEventListener("scroll", check);
        window.addEventListener("resize", check);
        return () => {
            el.removeEventListener("scroll", check);
            window.removeEventListener("resize", check);
        };
    }, []);

    const handleSort = (value) => {
        // Active chip click → clear, else set
        dispatch(setFilter({ key: "sort", value: filters.sort === value ? null : value }));
    };

    return (
        <div
            className="bg-white rounded-xl px-4 py-3 flex items-center gap-4"
            style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}
        >
            {/* Count */}
            <p className="text-[13px] font-medium text-text-muted shrink-0 whitespace-nowrap">
                {total === 0 ? (
                    "No courses"
                ) : (
                    <>
                        <span className="font-bold text-text-primary">{total.toLocaleString()}</span> courses
                    </>
                )}
            </p>

            <div className="hidden lg:block w-px h-4 bg-border shrink-0" />

            {/* Chips */}
            <div className="relative flex-1 min-w-0">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-1.5 overflow-x-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <span className="hidden lg:block text-[12px] font-semibold text-text-muted mr-1 shrink-0">
                        Sort by:
                    </span>

                    {/* ALL chip — always first */}
                    <button
                        onClick={() => dispatch(setFilter({ key: "sort", value: null }))}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0 whitespace-nowrap",
                            "transition-all duration-150 border",
                            !filters.sort
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-text-secondary border-border hover:border-primary/50 hover:text-primary hover:bg-primary-light"
                        )}
                    >
                        All
                    </button>

                    {SORT_OPTIONS.map((opt) => {
                        const active = filters.sort === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => handleSort(opt.value)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0 whitespace-nowrap",
                                    "transition-all duration-150 border",
                                    active
                                        ? "bg-primary text-white border-primary shadow-sm"
                                        : "bg-white text-text-secondary border-border hover:border-primary/50 hover:text-primary hover:bg-primary-light"
                                )}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                {showFade && (
                    <div
                        className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none"
                        style={{ background: "linear-gradient(to right, transparent, white)" }}
                    />
                )}
            </div>

            {total > 0 && (
                <p className="hidden xl:block text-[12px] text-text-muted shrink-0 whitespace-nowrap">
                    {from}–{to} of {total.toLocaleString()}
                </p>
            )}
        </div>
    );
}
