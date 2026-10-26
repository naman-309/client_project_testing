import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { selectFilters, setFilter, clearFilters } from "@/features/course/courseSlice";
import { cn } from "@/lib/utils";

const LEVELS = [
    { label: "Beginner", value: "beginner", dot: "bg-emerald-500" },
    { label: "Intermediate", value: "intermediate", dot: "bg-blue-500" },
    { label: "Advanced", value: "advanced", dot: "bg-violet-500" },
];

export default function CourseFilters({ categories = [] }) {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);

    const activeCount = [filters.category_id, filters.level].filter(Boolean).length;

    return (
        // sticky — navbar 70px + 16px gap = top-[86px]
        // scrollbarWidth none so no ugly scrollbar if content overflows
        <aside
            className="w-[250px] xl:w-[270px] shrink-0 sticky top-[86px]"
            style={{ maxHeight: "calc(100vh - 104px)", overflowY: "auto", scrollbarWidth: "none" }}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #E8ECF4", boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
                            <SlidersHorizontal size={13} className="text-primary" />
                        </div>
                        <span className="text-[14px] font-bold text-text-primary">Filters</span>
                        {activeCount > 0 && (
                            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={() => dispatch(clearFilters())}
                            className="text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Category */}
                <FilterSection title="Category">
                    <div className="space-y-0.5">
                        {categories.map((parent) => (
                            <ParentCategory
                                key={parent.id}
                                parent={parent}
                                activeId={filters.category_id}
                                onSelect={(id) =>
                                    dispatch(
                                        setFilter({
                                            key: "category_id",
                                            value: filters.category_id === id ? null : id,
                                        })
                                    )
                                }
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Level */}
                <FilterSection title="Level" isLast>
                    <div className="space-y-2">
                        {LEVELS.map((lvl) => {
                            const active = filters.level === lvl.value;
                            return (
                                <button
                                    key={lvl.value}
                                    onClick={() =>
                                        dispatch(
                                            setFilter({
                                                key: "level",
                                                value: active ? null : lvl.value,
                                            })
                                        )
                                    }
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                                        "border transition-all duration-150",
                                        active
                                            ? "border-primary bg-primary-light"
                                            : "border-border bg-white hover:border-primary/30 hover:bg-[#FAFBFF]"
                                    )}
                                >
                                    {/* Radio */}
                                    <div
                                        className={cn(
                                            "w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                            active ? "border-primary bg-primary" : "border-[#CBD5E1] bg-white"
                                        )}
                                    >
                                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", lvl.dot)} />
                                        <span
                                            className={cn(
                                                "text-[13px] font-semibold transition-colors",
                                                active ? "text-primary" : "text-text-primary"
                                            )}
                                        >
                                            {lvl.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>
            </div>
        </aside>
    );
}

function FilterSection({ title, children, isLast = false }) {
    const [open, setOpen] = useState(true);
    return (
        <div className={cn(!isLast && "border-b border-border")}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFBFF] transition-colors"
            >
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    {title}
                </span>
                {open ? (
                    <ChevronUp size={13} className="text-text-muted" />
                ) : (
                    <ChevronDown size={13} className="text-text-muted" />
                )}
            </button>
            {open && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}

function ParentCategory({ parent, activeId, onSelect }) {
    const isChildActive = parent.children?.some((c) => c.id === activeId);
    const [expanded, setExpanded] = useState(isChildActive);
    const hasChildren = parent.children?.length > 0;

    return (
        <div>
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150",
                    isChildActive ? "bg-primary-light text-primary" : "text-text-primary hover:bg-page"
                )}
            >
                <span className="text-[13px] font-semibold truncate">{parent.name}</span>
                {hasChildren &&
                    (expanded ? (
                        <ChevronUp size={12} className="text-text-muted shrink-0 ml-1" />
                    ) : (
                        <ChevronDown size={12} className="text-text-muted shrink-0 ml-1" />
                    ))}
            </button>

            {expanded && hasChildren && (
                <div className="ml-4 mt-0.5 pl-3 space-y-0.5 border-l-2 border-primary/20">
                    {parent.children.map((child) => {
                        const active = activeId === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => onSelect(child.id)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors duration-150",
                                    active
                                        ? "text-primary bg-primary-light"
                                        : "text-text-secondary hover:text-primary hover:bg-page"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                                        active ? "bg-primary" : "bg-[#CBD5E1]"
                                    )}
                                />
                                <span className="text-[12.5px] font-medium truncate">{child.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
