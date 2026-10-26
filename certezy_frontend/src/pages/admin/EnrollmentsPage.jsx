import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    Users,
    BookOpen,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Download,
    User,
    Mail,
    Calendar,
    BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

import enrollmentService from "@/services/enrollmentService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_COLORS = {
    active: { bg: "#F0FDF4", color: "#16A34A" },
    completed: { bg: "#EBF4FF", color: "#3282B8" },
    dropped: { bg: "#FEF2F2", color: "#EF4444" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnrollmentsPage() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState(null);

    // ── Load enrollments ───────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: PER_PAGE,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedCourse) params.course_id = selectedCourse;

            const { data } = await enrollmentService.getAllEnrollments(params);
            setEnrollments(data?.data ?? []);
            setTotalCount(data?.total ?? 0);
        } catch (err) {
            toast.error("Failed to load enrollments");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedCourse]);

    // ── Load stats ─────────────────────────────────────────────────────────────
    const loadStats = useCallback(async () => {
        try {
            const { data } = await enrollmentService.getEnrollmentStats();
            setStats(data?.data ?? {});
        } catch (err) {
            console.error("Failed to load stats");
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // ── Derived values ─────────────────────────────────────────────────────────
    const totalPages = Math.ceil(totalCount / PER_PAGE);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleCourseFilter = (value) => {
        setSelectedCourse(value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return "bg-green-500";
        if (progress >= 50) return "bg-blue-500";
        if (progress >= 20) return "bg-yellow-500";
        return "bg-red-500";
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Enrollments</h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Track student enrollments and course progress across all programs.
                    </p>
                </div>
                <button
                    onClick={() => {
                        // Export functionality can be added here
                        toast.info("Export feature coming soon!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Enrollments",
                            value: stats.totalEnrollments ?? 0,
                            icon: Users,
                            bg: "#EBF4FF",
                            color: "#3282B8",
                        },
                        {
                            label: "Active Students",
                            value: stats.activeEnrollments ?? 0,
                            icon: TrendingUp,
                            bg: "#F0FDF4",
                            color: "#16A34A",
                        },
                        {
                            label: "Completed",
                            value: stats.completedEnrollments ?? 0,
                            icon: BookOpen,
                            bg: "#F5F3FF",
                            color: "#8B5CF6",
                        },
                        {
                            label: "This Month",
                            value: stats.thisMonthEnrollments ?? 0,
                            icon: Calendar,
                            bg: "#FFFBEB",
                            color: "#F59E0B",
                        },
                    ].map(({ label, value, icon: Icon, bg, color }) => (
                        <div
                            key={label}
                            className="bg-white rounded-2xl border border-slate-100 p-5"
                            style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: bg }}
                                >
                                    <Icon size={20} style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {label}
                                    </p>
                                    <p className="text-[28px] font-extrabold text-slate-900 leading-none mt-0.5">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div
                className="bg-white rounded-2xl border border-slate-100 p-5"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search by student name or email..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                        >
                            <option value="">All Courses</option>
                            {/* Course options can be loaded dynamically */}
                        </select>
                    </div>
                </div>
            </div>

            {/* Enrollments Table */}
            <div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3282B8]" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-lg font-semibold text-slate-900">No enrollments found</p>
                        <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Student
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Course
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Enrolled
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Progress
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrollments.map((enrollment) => (
                                        <tr
                                            key={enrollment.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                                                        {enrollment.student_name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {enrollment.student_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {enrollment.student_email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {enrollment.course_title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        ID: {enrollment.payment_id}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">
                                                        {formatDate(enrollment.enrolled_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${getProgressColor(enrollment.progress)}`}
                                                                    style={{
                                                                        width: `${enrollment.progress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-600">
                                                                {enrollment.progress}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                    style={{
                                                        background:
                                                            STATUS_COLORS[enrollment.status]?.bg || "#F3F4F6",
                                                        color:
                                                            STATUS_COLORS[enrollment.status]?.color ||
                                                            "#374151",
                                                    }}
                                                >
                                                    {enrollment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                    Showing {(currentPage - 1) * PER_PAGE + 1} to{" "}
                                    {Math.min(currentPage * PER_PAGE, totalCount)} of {totalCount} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-3 py-1 text-sm text-slate-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
