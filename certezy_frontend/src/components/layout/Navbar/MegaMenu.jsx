import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import categoryService from "@/services/categoryService";
import { cn } from "@/lib/utils";

/**
 * MegaMenu.jsx
 *
 * Click flows:
 *   Child click      → /courses?category=:childSlug
 *   "More X →"       → /courses?category=:parentSlug
 *   "All Courses →"  → /courses
 *
 * API: GET /api/v1/categories
 * Response: [
 *   {
 *     id, name, slug, icon,
 *     children: [ { id, name, slug }, ... ]
 *   }
 * ]
 */
export default function MegaMenu({ onClose }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch categories on mount ──────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const { data } = await categoryService.getAll();
                setCategories(data.data.categories);
            } catch (err) {
                setError("Failed to load categories. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        // ── Backdrop ──────────────────────────────────────────
        <div className="fixed inset-0 z-50 top-[75px]" onClick={onClose}>
            {/* ── Panel ── */}
            <div className="relative max-w-[1280px] mx-auto px-6" onClick={(e) => e.stopPropagation()}>
                <div
                    className="bg-white overflow-hidden"
                    style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                >
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                        <p className="text-[13.5px] font-bold text-text-primary">Browse Categories</p>
                        <Link
                            to="/courses"
                            onClick={onClose}
                            className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            All Courses <ArrowRight size={13} />
                        </Link>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 130px)" }}>
                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-[13.5px]">Loading categories...</span>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="text-center py-16">
                                <p className="text-[13.5px] text-red-500">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-[13px] text-primary underline"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Categories grid — 3 columns, auto wrap */}
                        {!loading && !error && categories.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <CategoryCard key={cat.id} category={cat} onClose={onClose} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Single category card ──────────────────────────────────

// ── Single category card ──────────────────────────────────
function CategoryCard({ category, onClose }) {
    const visibleChildren = category.children?.slice(0, 4) || [];

    return (
        <div className="p-3 rounded-lg hover:bg-page transition-colors duration-150 group">
            {/* Category header — icon + name */}
            <Link
                to={`/courses?category_id=${category.id}`} // ✅ FIXED
                onClick={onClose}
                className="flex items-center gap-2 mb-2"
            >
                <div
                    className={cn(
                        "w-7 h-7 rounded flex items-center justify-center shrink-0",
                        "bg-primary-light group-hover:bg-primary transition-colors duration-200"
                    )}
                >
                    <CategoryIcon slug={category.slug} />
                </div>

                <span className="text-[13.5px] font-bold text-text-primary group-hover:text-primary transition-colors duration-200">
                    {category.name}
                </span>
            </Link>

            <div className="h-px bg-border mb-2" />

            {/* Children */}
            {visibleChildren.length > 0 ? (
                <ul className="space-y-0.5 mb-2">
                    {visibleChildren.map((child) => (
                        <li key={child.id}>
                            <Link
                                to={`/courses?category_id=${child.id}`} // ✅ FIXED
                                onClick={onClose}
                                className={cn(
                                    "block px-1.5 py-1 rounded text-[12.5px]",
                                    "text-text-secondary hover:text-primary hover:bg-primary-light",
                                    "transition-colors duration-150"
                                )}
                            >
                                {child.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[12px] text-text-muted px-1.5 mb-2 italic">Courses coming soon</p>
            )}

            {/* More → */}
            <Link
                to={`/courses?category_id=${category.id}`} // ✅ FIXED
                onClick={onClose}
                className="flex items-center gap-1 px-1.5 text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors"
            >
                More {category.name} <ArrowRight size={11} />
            </Link>
        </div>
    );
}

// ── Category icons — lucide based on slug ────────────────
function CategoryIcon({ slug }) {
    const iconProps = {
        size: 14,
        className: "text-primary group-hover:text-white transition-colors duration-200",
        strokeWidth: 2,
    };

    const icons = {
        "cloud-computing": <CloudIcon {...iconProps} />,
        "cyber-security": <ShieldIcon {...iconProps} />,
        devops: <GearIcon {...iconProps} />,
        "data-science": <ChartIcon {...iconProps} />,
        "project-management": <ClipboardIcon {...iconProps} />,
        networking: <NetworkIcon {...iconProps} />,
        "it-service-management": <HeadsetIcon {...iconProps} />,
        "software-development": <CodeIcon {...iconProps} />,
    };

    return icons[slug] || <DefaultIcon {...iconProps} />;
}

// ── Inline SVG icons ──────────────────────────────────────
const CloudIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
);

const ShieldIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const GearIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const ChartIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);

const ClipboardIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

const NetworkIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <rect x="2" y="2" width="6" height="6" />
        <rect x="16" y="2" width="6" height="6" />
        <rect x="16" y="16" width="6" height="6" />
        <rect x="2" y="16" width="6" height="6" />
        <line x1="8" y1="5" x2="16" y2="5" />
        <line x1="8" y1="19" x2="16" y2="19" />
        <line x1="5" y1="8" x2="5" y2="16" />
        <line x1="19" y1="8" x2="19" y2="16" />
    </svg>
);

const HeadsetIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);

const CodeIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const DefaultIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
