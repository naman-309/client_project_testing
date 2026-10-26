import api from "./api";

/**
 * courseService.js
 *
 * Backend base: /api/v1/courses
 *
 * PUBLIC:
 *   GET  /api/v1/courses              → all courses (filters + pagination)
 *   GET  /api/v1/courses/:slug        → single course
 *
 * Query params for getAllCourses:
 *   ?search=AWS                       → FULLTEXT search
 *   ?category=12                      → category_id filter
 *   ?level=beginner                   → level filter
 *   ?status=published                 → status filter
 *   ?page=1&limit=12                  → pagination
 *   ?is_featured=1                    → featured courses
 *
 * ADMIN ONLY:
 *   POST   /api/v1/courses/create       → create
 *   PUT    /api/v1/courses/update/:id   → update
 *   DELETE /api/v1/courses/delete/:id   → soft delete
 */

const courseService = {
    // Public
    getAll: (params = {}) => api.get("/courses", { params }),
    // params example:
    // { search: "AWS", category: 12, level: "beginner", page: 1, limit: 12 }

    getBySlug: (slug) => api.get(`/courses/${slug}`),

    // Admin only
    create: (data) => api.post("/courses/create", data),
    update: (id, data) => api.put(`/courses/update/${id}`, data),
    delete: (id) => api.delete(`/courses/delete/${id}`),
};

export default courseService;
