import { useState } from "react";

import { Link, useLocation, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    LayoutDashboard,
    BookOpen,
    Award,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

import { selectUser } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authSlice";
import { cn } from "@/lib/utils";
import ProfilePage from "@/pages/student/ProfilePage";
import BrandName from "@/components/shared/BrandName";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
    { label: "My Courses", icon: BookOpen, to: "/student/my-courses" },
    { label: "Certificates", icon: Award, to: "/student/certificates" },
    { label: "Payment History", icon: CreditCard, to: "/student/payments" },
    { label: "Profile", icon: User, to: "/student/profile" },
];

export default function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
        } finally {
            window.location.href = "/";
        }
    };

    return (
        <div
            className="min-h-screen bg-[#F1F5F9] flex"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-[240px] bg-white z-40 flex flex-col",
                    "border-r border-[#EEF2F7] transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0 lg:static lg:z-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ boxShadow: "2px 0 20px rgba(15,23,42,0.06)" }}
            >
                {/* Logo */}
                <div className="h-[70px] flex items-center px-5 border-b border-[#EEF2F7] shrink-0">
                    <Link
                        to="/"
                        className="flex items-center gap-2 no-underline"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="w-[30px] h-[30px] rounded-lg bg-[#3282B8] flex items-center justify-center shadow-sm shrink-0">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                color: "#0F172A",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            <BrandName accentColor="#3282B8" />
                        </span>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 no-underline group relative",
                                        active
                                            ? "bg-[#EBF4FF] text-[#3282B8]"
                                            : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                                    )}
                                >
                                    {/* Active left border */}
                                    {active && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-[#3282B8]" />
                                    )}
                                    <Icon
                                        size={17}
                                        className={cn(
                                            "shrink-0 transition-colors",
                                            active
                                                ? "text-[#3282B8]"
                                                : "text-[#94A3B8] group-hover:text-[#3282B8]"
                                        )}
                                    />
                                    <span
                                        style={{
                                            fontSize: "13.5px",
                                            fontWeight: active ? 700 : 500,
                                        }}
                                    >
                                        {label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom — user + logout */}
                <div className="shrink-0 border-t border-[#EEF2F7] p-4 space-y-3">
                    {/* User info */}
                    {user && (
                        <div className="flex items-center gap-3 px-1">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                                style={{ background: "linear-gradient(135deg, #3282B8, #0a1628)" }}
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}
                                    className="truncate"
                                >
                                    {user.name}
                                </p>
                                <p style={{ fontSize: "11px", color: "#94A3B8" }} className="truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                            "text-[#EF4444] hover:bg-[#FEF2F2] transition-colors duration-150"
                        )}
                    >
                        <LogOut size={16} className="shrink-0" />
                        <span style={{ fontSize: "13.5px", fontWeight: 500 }}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile topbar */}
                <div className="lg:hidden h-[60px] bg-white border-b border-[#EEF2F7] flex items-center px-4 gap-3 sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                        <BrandName accentColor="#3282B8" />
                    </span>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
