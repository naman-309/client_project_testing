import { useState, useEffect } from "react";
import { Star, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import reviewService from "@/services/reviewService";

// ─── Rating Stars Component ───────────────────────────────────────────────────
const RatingStars = ({ rating, size = 16 }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"}
                />
            ))}
            <span className="ml-1 text-sm text-[#374151] font-medium">{rating}</span>
        </div>
    );
};

// ─── Review Card Component ─────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center text-[#3282B8] text-sm font-semibold">
                        {review.student_name?.slice(0, 2)?.toUpperCase() || "??"}
                    </div>
                    <div>
                        <div className="font-semibold text-[#374151]">
                            {review.student_name || "Anonymous Student"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Calendar size={12} />
                            {formatDate(review.created_at)}
                        </div>
                    </div>
                </div>
                <RatingStars rating={review.rating} />
            </div>

            {/* Comment */}
            <div className="text-[#374151] leading-relaxed">{review.comment}</div>
        </div>
    );
};

// ─── Main Review List Component ─────────────────────────────────────────────
export default function ReviewList({ courseId, className }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReviews = async () => {
            if (!courseId) return;

            setLoading(true);
            setError(null);
            try {
                const response = await reviewService.getCourseReviews(courseId);
                setReviews(response?.data?.reviews || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, [courseId]);

    if (loading) {
        return (
            <div className={cn("space-y-4", className)}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                        <div className="animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#E5E7EB]"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-[#E5E7EB] rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-[#E5E7EB] rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-16 bg-[#E5E7EB] rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("text-center py-8", className)}>
                <div className="text-[#EF4444] font-medium mb-2">Error loading reviews</div>
                <div className="text-[#6B7280] text-sm">{error}</div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className={cn("text-center py-8", className)}>
                <div className="w-16 h-16 rounded-full bg-[#EBF4FF] flex items-center justify-center mx-auto mb-4">
                    <Star className="text-[#3282B8]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#374151] mb-2">No reviews yet</h3>
                <p className="text-[#6B7280]">Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}
