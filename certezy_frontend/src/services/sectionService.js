import api from "./api";

/**
 * sectionService.js
 *
 * Backend base: /api/v1/sections
 *
 * PUBLIC:
 *   GET  /api/v1/sections/course/:course_id  → all sections of a course
 *   GET  /api/v1/sections/:id                → single section
 *
 * ADMIN ONLY:
 *   POST   /api/v1/sections/create
 *   PUT    /api/v1/sections/update/:id
 *   DELETE /api/v1/sections/delete/:id
 */

const sectionService = {
    // Public
    getByCourseId: (courseId) => api.get(`/sections/course/${courseId}`),
    getById: (id) => api.get(`/sections/${id}`),

    // Admin only
    create: (data) => api.post("/sections/create", data),
    update: (id, data) => api.put(`/sections/update/${id}`, data),
    delete: (id) => api.delete(`/sections/delete/${id}`),
};

export default sectionService;
