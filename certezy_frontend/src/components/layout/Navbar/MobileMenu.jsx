import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronDown, Loader2, BookOpen, LayoutGrid } from "lucide-react";
import { logoutUser } from "@/features/auth/authSlice";
import categoryService from "@/services/categoryService";
import Searchbar from "./Searchbar";
import { MORE_ITEMS, STUDENT_MENU_ITEMS } from "./navbar.data";
import { cn } from "@/lib/utils";

/**
 * MobileMenu.jsx
 *
 * Props:
 *   isLoggedIn → boolean
 *   user       → { name, email, role } or null
 *   onClose    → close menu callback
 */
export default function MobileMenu({ isLoggedIn, user, onClose }) {
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catOpen, setCatOpen] = useState(false);

    const handleLogout = async () => {
        onClose();
        try {
            await dispatch(logoutUser());
        } finally {
            window.location.href = "/";
        }
    };

    // ── Fetch categories ─────────────────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await categoryService.getAll();
                // ✅ same as MegaMenu — data.data.categories
                setCategories(data.data.categories ?? data.data ?? []);
            } catch {
                // silent fail
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="border-t border-border bg-white animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-4 py-4 space-y-0.5 max-h-[80vh] overflow-y-auto">
                {/* Search */}
                <div className="pb-3">
                    <Searchbar className="max-w-full" />
                </div>

                {/* ── All Courses — direct link ── */}
                <Link
                    to="/courses"
                    onClick={onClose}
                    className={cn(
                        "flex items-center gap-2.5 px-2 py-2.5 rounded",
                        "text-[14px] font-medium text-text-secondary",
                        "hover:bg-primary-light hover:text-primary",
                        "transition-colors duration-150"
                    )}
                >
                    <LayoutGrid size={15} className="text-text-muted shrink-0" />
                    All Courses
                </Link>

                {/* ── Browse Categories accordion ── */}
                <button
                    onClick={() => setCatOpen(!catOpen)}
                    className={cn(
                        "w-full flex items-center justify-between",
                        "px-2 py-2.5 rounded text-[14px] font-medium",
                        "text-text-secondary hover:bg-primary-light hover:text-primary",
                        "transition-colors duration-150"
                    )}
                >
                    <span className="flex items-center gap-2.5">
                        <BookOpen size={15} className="text-text-muted shrink-0" />
                        Browse Categories
                    </span>
                    <ChevronDown
                        size={15}
                        className={cn(
                            "transition-transform duration-200 text-text-muted",
                            catOpen && "rotate-180"
                        )}
                    />
                </button>

                {/* Categories list */}
                {catOpen && (
                    <div className="ml-[30px] space-y-0.5 pb-1 border-l border-border pl-3">
                        {loading ? (
                            <div className="flex items-center gap-2 py-3 text-text-muted">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[13px]">Loading...</span>
                            </div>
                        ) : categories.length > 0 ? (
                            <>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/courses?category_id=${cat.id}`}
                                        onClick={onClose}
                                        className={cn(
                                            "block px-2 py-2 rounded",
                                            "text-[13.5px] font-medium text-text-secondary",
                                            "hover:bg-primary-light hover:text-primary",
                                            "transition-colors duration-150"
                                        )}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                                <Link
                                    to="/courses"
                                    onClick={onClose}
                                    className="block px-2 py-2 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
                                >
                                    View all courses →
                                </Link>
                            </>
                        ) : (
                            <p className="text-[13px] text-text-muted px-2 py-2">No categories found</p>
                        )}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-border !my-2" />

                {/* More items */}
                {MORE_ITEMS.map((item, i) =>
                    item.divider ? (
                        <div key={i} className="h-px bg-border !my-2" />
                    ) : (
                        <Link
                            key={i}
                            to={item.to}
                            onClick={onClose}
                            className={cn(
                                "block px-2 py-2.5 rounded",
                                "text-[14px] font-medium text-text-secondary",
                                "hover:bg-primary-light hover:text-primary",
                                "transition-colors duration-150"
                            )}
                        >
                            {item.label}
                        </Link>
                    )
                )}

                {/* Divider */}
                <div className="h-px bg-border !my-2" />

                {/* Student menu — logged in */}
                {isLoggedIn && user && (
                    <>
                        {/* User info pill */}
                        <div className="flex items-center gap-3 px-2 py-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <span className="text-white text-[11px] font-bold">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13.5px] font-semibold text-text-primary truncate">
                                    {user.name}
                                </p>
                                <p className="text-[12px] text-text-muted truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            {STUDENT_MENU_ITEMS.map((item, i) =>
                                item.divider ? (
                                    <div key={i} className="h-px bg-border !my-2" />
                                ) : item.danger ? (
                                    <button
                                        key={i}
                                        onClick={handleLogout}
                                        className={cn(
                                            "w-full text-left block px-2 py-2.5 rounded text-[14px] font-medium",
                                            "transition-colors duration-150 text-red-500 hover:bg-red-50"
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link
                                        key={i}
                                        to={item.to}
                                        onClick={onClose}
                                        className={cn(
                                            "block px-2 py-2.5 rounded text-[14px] font-medium",
                                            "transition-colors duration-150 text-text-secondary hover:bg-primary-light hover:text-primary"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </div>
                    </>
                )}

                {/* Auth buttons — not logged in */}
                {!isLoggedIn && (
                    <div className="flex gap-2 pt-2 pb-1">
                        <Link
                            to="/login"
                            onClick={onClose}
                            className={cn(
                                "flex-1 text-center py-2.5 rounded",
                                "border-[1.5px] border-border",
                                "text-[14px] font-semibold text-text-primary",
                                "hover:border-primary hover:text-primary transition-colors duration-200"
                            )}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            onClick={onClose}
                            className={cn(
                                "flex-1 text-center py-2.5 rounded",
                                "bg-primary hover:bg-primary-hover",
                                "text-[14px] font-semibold text-white",
                                "transition-colors duration-200"
                            )}
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
