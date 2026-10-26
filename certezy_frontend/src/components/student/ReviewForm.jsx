import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import reviewService from "@/services/reviewService";

// ─── Interactive Rating Stars Component ─────────────────────────────────────
const InteractiveRatingStars = ({ rating, onRatingChange, size = 24 }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-colors duration-200"
                >
                    <Star
                        size={size}
                        className={
                            star <= (hoveredRating || rating)
                                ? "fill-[#F59E0B] text-[#F59E0B] scale-110"
                                : "text-[#E5E7EB] hover:text-[#F59E0B] hover:scale-110"
                        }
                    />
                </button>
            ))}
        </div>
    );
};

// ─── Main Review Form Component ─────────────────────────────────────────────
export default function ReviewForm({ courseId, onReviewSubmitted, className }) {
    const [formData, setFormData] = useState({
        rating: 0,
        comment: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (formData.comment.trim().length < 10) {
            toast.error("Review must be at least 10 characters long");
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewService.createReview({
                course_id: courseId,
                rating: formData.rating,
                comment: formData.comment.trim(),
            });

            toast.success("Review submitted successfully!");
            setFormData({ rating: 0, comment: "" });
            setShowForm(false);

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRatingChange = (newRating) => {
        setFormData((prev) => ({ ...prev, rating: newRating }));
    };

    const handleCommentChange = (e) => {
        setFormData((prev) => ({ ...prev, comment: e.target.value }));
    };

    if (!showForm) {
        return (
            <div className={cn("text-center", className)}>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#3282B8] text-white font-medium rounded-xl hover:bg-[#2a6fa0] transition-colors"
                >
                    <Star size={18} />
                    Write a Review
                </button>
            </div>
        );
    }

    return (
        <div className={cn("bg-white rounded-xl border border-[#E5E7EB] p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#374151]">Write a Review</h3>
                <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F8F9FA] transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-[#374151] mb-3">
                        Rating <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="flex justify-center">
                        <InteractiveRatingStars
                            rating={formData.rating}
                            onRatingChange={handleRatingChange}
                        />
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-[#374151] mb-3">
                        Review <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                        rows={4}
                        value={formData.comment}
                        onChange={handleCommentChange}
                        placeholder="Share your experience with this course..."
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-[#374151] bg-white focus:outline-none focus:border-[#3282B8] focus:ring-2 focus:ring-[#3282B8]/10 transition-all resize-none"
                        maxLength={1000}
                    />
                    <div className="text-xs text-[#9CA3AF] mt-1 text-right">
                        {formData.comment.length}/1000 characters
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "inline-flex items-center gap-2 px-6 py-3 bg-[#3282B8] text-white font-medium rounded-xl transition-colors",
                            isSubmitting && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit Review
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
