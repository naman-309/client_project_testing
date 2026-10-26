import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    Mail,
    MessageSquare,
    CheckCircle,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Archive,
    Reply,
    Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_COLORS = {
    new: { bg: "#FFFBEB", color: "#F59E0B", icon: Clock },
    read: { bg: "#EBF4FF", color: "#3282B8", icon: MessageSquare },
    resolved: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
};

// ─── Contact Service ───────────────────────────────────────────────────────────

const contactService = {
    getAllMessages: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append("status", params.status);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        const url = `/contact${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        return api.get(url);
    },

    getMessageById: (id) => api.get(`/contact/${id}`),

    updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
};

import api from "@/services/api";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState(null);

    // Modal states
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // ── Load messages ─────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: PER_PAGE,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedStatus) params.status = selectedStatus;

            const { data } = await contactService.getAllMessages(params);
            setMessages(data?.data ?? []);
            setTotalCount(data?.pagination?.total ?? 0);

            // Calculate stats from messages
            const newCount = data?.data?.filter((m) => m.status === "new").length || 0;
            const readCount = data?.data?.filter((m) => m.status === "read").length || 0;
            const resolvedCount = data?.data?.filter((m) => m.status === "resolved").length || 0;

            setStats({
                total: data?.data?.length || 0,
                new: newCount,
                read: readCount,
                resolved: resolvedCount,
            });
        } catch (err) {
            toast.error("Failed to load contact messages");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedStatus]);

    useEffect(() => {
        load();
    }, [load]);

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

    const handleMessageClick = async (message) => {
        try {
            // Use message from list directly instead of separate API call
            setSelectedMessage(message);
            setShowMessageModal(true);
        } catch (err) {
            toast.error("Failed to load message details");
        }
    };

    const handleStatusUpdate = async (messageId, newStatus) => {
        try {
            setUpdatingStatus(true);
            await contactService.updateStatus(messageId, newStatus);

            // Update local state
            setMessages((prev) =>
                prev.map((msg) => (msg.id === messageId ? { ...msg, status: newStatus } : msg))
            );

            if (selectedMessage?.id === messageId) {
                setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
            }

            toast.success(`Message marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Invalid Date";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const truncateMessage = (message, length = 100) => {
        if (!message || typeof message !== "string") return "No message";
        return message.length > length ? message.substring(0, length) + "..." : message;
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 px-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                        Contact Management
                    </h1>
                    <p className="text-[13.5px] text-slate-500 mt-0.5">
                        Handle customer support tickets and inquiries efficiently.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Messages",
                            value: stats.total,
                            icon: MessageSquare,
                            bg: "#EBF4FF",
                            color: "#3282B8",
                        },
                        { label: "New", value: stats.new, icon: Clock, bg: "#FFFBEB", color: "#F59E0B" },
                        {
                            label: "Read",
                            value: stats.read,
                            icon: MessageSquare,
                            bg: "#EBF4FF",
                            color: "#3282B8",
                        },
                        {
                            label: "Resolved",
                            value: stats.resolved,
                            icon: CheckCircle,
                            bg: "#F0FDF4",
                            color: "#16A34A",
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
                                placeholder="Search by name, email, or subject..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13.5px] text-slate-800 outline-none focus:border-[#3282B8] focus:bg-white transition-colors"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages Table */}
            <div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3282B8]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20">
                        <Mail className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-lg font-semibold text-slate-900">No messages found</p>
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
                                            Customer
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Subject
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Message
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Status
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Date
                                        </th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {messages.map((message) => {
                                        const StatusIcon = STATUS_COLORS[message.status]?.icon || Clock;
                                        const statusStyle = STATUS_COLORS[message.status] || {
                                            bg: "#F3F4F6",
                                            color: "#374151",
                                        };

                                        return (
                                            <tr
                                                key={message.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {message.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {message.email}
                                                        </p>
                                                        {message.phone && (
                                                            <p className="text-xs text-slate-400">
                                                                {message.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {message.subject}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 line-clamp-2">
                                                        {truncateMessage(message.message)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon
                                                            size={14}
                                                            style={{ color: statusStyle.color }}
                                                        />
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                background: statusStyle.bg,
                                                                color: statusStyle.color,
                                                            }}
                                                        >
                                                            {message.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calendar size={14} />
                                                        <span className="text-sm">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleMessageClick(message)}
                                                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                                                            title="View Message"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        {message.status === "new" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusUpdate(message.id, "read")
                                                                }
                                                                disabled={updatingStatus}
                                                                className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                                title="Mark as Read"
                                                            >
                                                                <MessageSquare size={14} />
                                                            </button>
                                                        )}
                                                        {message.status === "read" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusUpdate(message.id, "resolved")
                                                                }
                                                                disabled={updatingStatus}
                                                                className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                                                title="Mark as Resolved"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}
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

            {/* Message Detail Modal */}
            {showMessageModal && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {selectedMessage.subject}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">From:</span> {selectedMessage.name}{" "}
                                            ({selectedMessage.email})
                                        </p>
                                        {selectedMessage.phone && (
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Phone:</span>{" "}
                                                {selectedMessage.phone}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Received:</span>{" "}
                                            {formatDate(selectedMessage.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 overflow-y-auto max-h-96">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Status:</span>
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                            background:
                                                STATUS_COLORS[selectedMessage.status]?.bg || "#F3F4F6",
                                            color: STATUS_COLORS[selectedMessage.status]?.color || "#374151",
                                        }}
                                    >
                                        {selectedMessage.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedMessage.status === "new" && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedMessage.id, "read")}
                                            disabled={updatingStatus}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            <MessageSquare size={16} />
                                            Mark as Read
                                        </button>
                                    )}
                                    {selectedMessage.status === "read" && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedMessage.id, "resolved")}
                                            disabled={updatingStatus}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle size={16} />
                                            Mark as Resolved
                                        </button>
                                    )}
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3282B8] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors">
                                        <Reply size={16} />
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
