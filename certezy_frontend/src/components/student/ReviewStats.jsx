import { useState, useEffect } from "react";
import { Star, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import reviewService from "@/services/reviewService";

// ─── Rating Stars Component ───────────────────────────────────────────────────
const RatingStars = ({ rating, size = 20 }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"}
                />
            ))}
        </div>
    );
};

// ─── Review Stats Component ────────────────────────────────────────────────────
export default function ReviewStats({ courseId, className }) {
    const [stats, setStats] = useState({
        rating_avg: 0,
        rating_count: 0,
        distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        },
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            if (!courseId) return;

            setLoading(true);
            try {
                const response = await reviewService.getCourseReviews(courseId);
                const reviews = response?.data?.reviews || [];

                // Calculate stats
                const totalReviews = reviews.length;
                const avgRating =
                    totalReviews > 0
                        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                        : 0;

                const distribution = reviews.reduce(
                    (acc, review) => {
                        acc[review.rating] = (acc[review.rating] || 0) + 1;
                        return acc;
                    },
                    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                );

                setStats({
                    rating_avg: avgRating,
                    rating_count: totalReviews,
                    distribution,
                });
            } catch (err) {
                console.error("Failed to load review stats:", err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [courseId]);

    const maxCount = Math.max(...Object.values(stats.distribution));

    if (loading) {
        return (
            <div className={cn("bg-white rounded-xl border border-[#E5E7EB] p-6", className)}>
                <div className="animate-pulse">
                    <div className="h-8 bg-[#E5E7EB] rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-6 bg-[#E5E7EB] rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("bg-white rounded-xl border border-[#E5E7EB] p-6", className)}>
            {/* Average Rating */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[#374151]">{stats.rating_avg.toFixed(1)}</div>
                        <div className="text-sm text-[#6B7280]">Average Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-semibold text-[#374151]">{stats.rating_count}</div>
                        <div className="text-sm text-[#6B7280]">Total Reviews</div>
                    </div>
                </div>
                <RatingStars rating={Math.round(stats.rating_avg)} />
            </div>

            {/* Rating Distribution */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-[#6B7280]" />
                    <h3 className="font-semibold text-[#374151]">Rating Distribution</h3>
                </div>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.distribution[rating];
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-2 w-16">
                                    <RatingStars rating={rating} size={14} />
                                    <span className="text-sm text-[#6B7280]">({count})</span>
                                </div>
                                <div className="flex-1">
                                    <div className="h-6 bg-[#F8F9FA] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
