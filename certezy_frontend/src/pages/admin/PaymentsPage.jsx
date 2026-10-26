import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    DollarSign,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Download,
    CreditCard,
    Calendar,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import paymentService from "@/services/paymentService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_COLORS = {
    success: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
    pending: { bg: "#FFFBEB", color: "#F59E0B", icon: Clock },
    failed: { bg: "#FEF2F2", color: "#EF4444", icon: XCircle },
};

const METHOD_ICONS = {
    razorpay: "💳",
    paypal: "🅿️",
    stripe: "🟦",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState(null);

    // ── Load payments ─────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: PER_PAGE,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedStatus) params.status = selectedStatus;
            if (selectedMethod) params.method = selectedMethod;
            if (selectedCurrency) params.currency = selectedCurrency;

            const { data } = await paymentService.getAllPayments(params);
            setPayments(data?.data ?? []);
            setTotalCount(data?.total ?? 0);
        } catch (err) {
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedStatus, selectedMethod, selectedCurrency]);

    // ── Load stats from API
    const loadStats = useCallback(async () => {
        try {
            const { data } = await paymentService.getRevenueStats();
            const apiStats = data.data;

            // Calculate payment counts from current payments data
            const successCount = payments.filter((p) => p.status === "success").length;
            const pendingCount = payments.filter((p) => p.status === "pending").length;
            const failedCount = payments.filter((p) => p.status === "failed").length;

            setStats({
                total_revenue_usd: apiStats.total_revenue_usd || "0.00",
                total_sales: apiStats.total_sales || 0,
                monthly_revenue: apiStats.monthly_revenue || "0.00",
                successCount,
                pendingCount,
                failedCount,
                totalCount: payments.length,
            });
        } catch (err) {
            console.error("Failed to load revenue stats:", err);
            // Set default stats to prevent UI break
            setStats({
                total_revenue_usd: "0.00",
                total_sales: 0,
                monthly_revenue: "0.00",
                successCount: 0,
                pendingCount: 0,
                failedCount: 0,
                totalCount: 0,
            });
        }
    }, [payments]);

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

    const handleStatusFilter = (value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    };

    const handleMethodFilter = (value) => {
        setSelectedMethod(value);
        setCurrentPage(1);
    };

    const handleCurrencyFilter = (value) => {
        setSelectedCurrency(value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount, currency) => {
        const num = parseFloat(amount || 0);
        const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
        return `${symbol}${num.toFixed(2)}`;
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                        Payments & Revenue
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Track all payment transactions and revenue across your platform.
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
                            label: "Total Revenue",
                            value: `$${stats.total_revenue_usd}`,
                            icon: DollarSign,
                            bg: "#F0FDF4",
                            color: "#16A34A",
                        },
                        {
                            label: "Total Sales",
                            value: stats.total_sales,
                            icon: CheckCircle,
                            bg: "#EBF4FF",
                            color: "#3282B8",
                        },
                        {
                            label: "Successful",
                            value: stats.successCount,
                            icon: CheckCircle,
                            bg: "#EBF4FF",
                            color: "#3282B8",
                        },
                        {
                            label: "Pending",
                            value: stats.pendingCount,
                            icon: Clock,
                            bg: "#FFFBEB",
                            color: "#F59E0B",
                        },
                        {
                            label: "Failed",
                            value: stats.failedCount,
                            icon: XCircle,
                            bg: "#FEF2F2",
                            color: "#EF4444",
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search by student or course..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                        />
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select
                        value={selectedMethod}
                        onChange={(e) => handleMethodFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                    >
                        <option value="">All Methods</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="paypal">PayPal</option>
                        <option value="stripe">Stripe</option>
                    </select>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => handleCurrencyFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                    >
                        <option value="">All Currencies</option>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3282B8]" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-20">
                        <CreditCard className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-lg font-semibold text-slate-900">No payments found</p>
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
                                            Amount
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            USD Value
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Method
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Status
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Date
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Reference
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((payment) => {
                                        const StatusIcon = STATUS_COLORS[payment.status]?.icon || AlertCircle;
                                        const statusStyle = STATUS_COLORS[payment.status] || {
                                            bg: "#F3F4F6",
                                            color: "#374151",
                                        };

                                        return (
                                            <tr
                                                key={payment.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                                                            {payment.student_name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {payment.student_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {payment.student_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {payment.course_title}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-slate-900">
                                                            {formatAmount(
                                                                payment.paid_amount,
                                                                payment.currency
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {payment.currency}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-green-600">
                                                            $
                                                            {payment.usd_amount
                                                                ? parseFloat(payment.usd_amount).toFixed(2)
                                                                : "0.00"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 bg-green-50 px-2 py-1 rounded">
                                                            USD
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {METHOD_ICONS[payment.method] || "💳"}
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-700 capitalize">
                                                            {payment.method}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: statusStyle.color }}
                                                        />
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                background: statusStyle.bg,
                                                                color: statusStyle.color,
                                                            }}
                                                        >
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calendar size={14} />
                                                        <span className="text-sm">
                                                            {formatDate(payment.created_at)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                        {payment.gateway_txn_id || "N/A"}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
