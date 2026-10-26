import api from "./api";

/**
 * enrollmentService.js
 *
 * Base: /api/v1/enrollments
 *
 * STUDENT:
 *   GET  /api/v1/enrollments          → my enrolled courses (with progress)
 *   GET  /api/v1/enrollments/:courseId → am I enrolled in this course?
 *
 * ADMIN:
 *   GET  /api/v1/enrollments/admin/all → all enrollments with filters
 *   GET  /api/v1/enrollments/admin/stats → enrollment statistics
 */

const enrollmentService = {
    // GET /enrollments — student ke saare enrolled courses
    getMyEnrollments: () => api.get("/enrollments"),

    // GET /enrollments/:courseId — check if enrolled
    checkEnrollment: (courseId) => api.get(`/enrollments/${courseId}`),

    // Admin endpoints as specified
    getAllEnrollments: (params = {}) => {
        // Support ?course_id=123 filter
        const queryParams = new URLSearchParams();
        if (params.course_id) queryParams.append("course_id", params.course_id);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        const url = `/enrollments/admin/all${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        return api.get(url);
    },

    getEnrollmentStats: () => {
        return api.get("/enrollments/admin/stats");
    },
};

export default enrollmentService;
