import api from "./api";

/**
 * reviewService.js — /api/v1/reviews
 *
 * PUBLIC
 *   GET    /reviews/featured            latest approved reviews (homepage)
 *   GET    /reviews/:courseId           approved reviews for a course
 * STUDENT
 *   POST   /reviews                     create a review
 * ADMIN
 *   GET    /reviews/admin/all           all reviews (?page&limit&is_approved)
 *   GET    /reviews/admin/pending       pending reviews (?limit)
 *   PUT    /reviews/:id/approval        { is_approved: 0 | 1 }
 *   DELETE /reviews/:id
 */

const reviewService = {
    // Public
    getFeaturedReviews: (limit = 6) => api.get("/reviews/featured", { params: { limit } }),
    getCourseReviews: (courseId, params = {}) => api.get(`/reviews/${courseId}`, { params }),

    // Student
    createReview: (data) => api.post("/reviews", data),

    // Admin
    getAllReviews: (params = {}) => api.get("/reviews/admin/all", { params }),
    getPendingReviews: (limit = 10) => api.get("/reviews/admin/pending", { params: { limit } }),
    updateReviewApproval: (id, { is_approved }) => api.put(`/reviews/${id}/approval`, { is_approved }),
    approveReview: (id) => api.put(`/reviews/${id}/approval`, { is_approved: 1 }),
    rejectReview: (id) => api.put(`/reviews/${id}/approval`, { is_approved: 0 }),
    deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;
