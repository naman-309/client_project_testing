import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search,
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter,
    Star,
    Users,
    BookOpen,
    Calendar,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import reviewService from "@/services/reviewService";

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 10;
const STATUS_OPTIONS = [
    { value: "", label: "All Reviews", color: "#6B7280" },
    { value: "1", label: "Approved", color: "#16A34A" },
    { value: "0", label: "Pending", color: "#F59E0B" },
];

// ─── Field Style ──────────────────────────────────────────────────────────────
const fieldCls =
    "w-full px-3.5 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] bg-white focus:outline-none focus:border-[#3282B8] focus:ring-2 focus:ring-[#3282B8]/10 transition-all";

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReviewsManagementPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // ── Load Reviews ────────────────────────────────────────────────────────
    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: PER_PAGE,
                ...(statusFilter && { is_approved: statusFilter }),
                ...(searchTerm && { search: searchTerm }),
            };

            const { data } = await reviewService.getAllReviews(params);
            // API shape: { data: Review[], pagination: { total, totalPages } }
            setReviews(Array.isArray(data?.data) ? data.data : data?.data?.reviews || []);
            setTotal(data?.pagination?.total || 0);
            setTotalPages(data?.pagination?.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchTerm]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // ── Review Actions ─────────────────────────────────────────────────────
    const handleApprove = async (reviewId) => {
        try {
            await reviewService.updateReviewApproval(reviewId, { is_approved: 1 });
            toast.success("Review approved successfully");
            loadReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve review");
        }
    };

    const handleReject = async (reviewId) => {
        try {
            await reviewService.updateReviewApproval(reviewId, { is_approved: 0 });
            toast.success("Review rejected successfully");
            loadReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject review");
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await reviewService.deleteReview(reviewId);
            toast.success("Review deleted successfully");
            loadReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete review");
        }
    };

    // ── Pagination ───────────────────────────────────────────────────────────
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const matchesSearch =
                !searchTerm ||
                review.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !statusFilter || String(review.is_approved) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchTerm, statusFilter]);

    // ── Status Badge ─────────────────────────────────────────────────────────
    const StatusBadge = ({ approved }) => {
        const config = approved
            ? { bg: "#F0FDF4", color: "#16A34A", text: "Approved" }
            : { bg: "#FFFBEB", color: "#F59E0B", text: "Pending" };

        return (
            <span
                className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    "bg-[#F0FDF4] text-[#16A34A]"
                )}
            >
                {config.text}
            </span>
        );
    };

    // ── Rating Stars ───────────────────────────────────────────────────────────
    const RatingStars = ({ rating }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"}
                    />
                ))}
                <span className="ml-1 text-sm text-[#374151] font-medium">{rating}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#374151]">Reviews Management</h1>
                        <p className="text-sm text-[#6B7280] mt-1">Manage and moderate course reviews</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-[#6B7280]">
                            Total: <span className="font-semibold text-[#374151]">{total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by student name, course, or comment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(fieldCls, "pl-10")}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={fieldCls}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3282B8]"></div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-[#EBF4FF] flex items-center justify-center mx-auto mb-4">
                            <Star className="text-[#3282B8]" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-[#374151] mb-2">No reviews found</h3>
                        <p className="text-[#6B7280]">
                            {searchTerm || statusFilter
                                ? "Try adjusting your search or filters"
                                : "No reviews available yet"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-[#F8F9FA] border-b border-[#E5E7EB] px-6 py-3">
                            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                                <div className="col-span-3">Student</div>
                                <div className="col-span-3">Course</div>
                                <div className="col-span-2">Rating</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1">Actions</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-[#E5E7EB]">
                            {filteredReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="px-6 py-4 hover:bg-[#F8F9FA] transition-colors"
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Student Info */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#EBF4FF] flex items-center justify-center text-[#3282B8] text-sm font-semibold">
                                                    {review.student_name?.slice(0, 2)?.toUpperCase() || "??"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-[#374151]">
                                                        {review.student_name || "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-[#9CA3AF]">
                                                        ID: {review.user_id || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Info */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="text-[#9CA3AF]" size={14} />
                                                <div>
                                                    <div className="text-sm font-medium text-[#374151] truncate">
                                                        {review.course_title || "Unknown Course"}
                                                    </div>
                                                    <div className="text-xs text-[#9CA3AF]">
                                                        ID: {review.course_id || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="col-span-2">
                                            <RatingStars rating={review.rating} />
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                                <Calendar className="text-[#9CA3AF]" size={12} />
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1">
                                            <StatusBadge approved={review.is_approved === 1} />
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1">
                                            <div className="flex items-center gap-1">
                                                {review.is_approved === 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(review.id)}
                                                            className="p-1.5 rounded-lg bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] transition-colors"
                                                            title="Approve Review"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(review.id)}
                                                            className="p-1.5 rounded-lg bg-[#FFFBEB] text-[#F59E0B] hover:bg-[#FEF3C7] transition-colors"
                                                            title="Reject Review"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredReviews.length > 0 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-[#6B7280]">
                            Showing {(currentPage - 1) * PER_PAGE + 1} to{" "}
                            {Math.min(currentPage * PER_PAGE, filteredReviews.length)} of {total} reviews
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={cn(
                                    "p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FA] transition-colors",
                                    currentPage === 1 && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                                                page === currentPage
                                                    ? "bg-[#3282B8] text-white"
                                                    : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FA]"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FA] transition-colors",
                                    currentPage === totalPages && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
