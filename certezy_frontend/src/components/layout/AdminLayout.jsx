import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    LayoutDashboard,
    Users,
    Shield,
    Tag,
    BookOpen,
    FileText,
    TestTube,
    HelpCircle,
    CreditCard,
    Percent,
    Award,
    MessageSquare,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

import { selectUser } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authSlice";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/token";

const ADMIN_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Categories", icon: Tag, to: "/admin/categories" },
    { label: "Courses", icon: BookOpen, to: "/admin/courses" },
    { label: "Enrollments", icon: Users, to: "/admin/enrollments" },
    { label: "Payments", icon: CreditCard, to: "/admin/payments" },
    { label: "Discounts", icon: Percent, to: "/admin/discounts" },
    { label: "Reviews", icon: MessageSquare, to: "/admin/reviews" },
    { label: "Certificates", icon: Award, to: "/admin/certificates" },
    { label: "Contact", icon: MessageSquare, to: "/admin/contact" },
];

export default function AdminLayout() {
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
            className="min-h-screen bg-gray-50 flex"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold" style={{ color: tokens.color.primary }}>
                        Certezy Admin
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {ADMIN_NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                        {isActive && <ChevronRight size={16} className="ml-auto" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                                {user?.name?.charAt(0)?.toUpperCase() || "A"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || "Admin User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || "admin@certezy.com"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Add notifications, user menu etc here */}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
