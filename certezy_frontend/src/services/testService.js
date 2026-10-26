import api from "./api";

/**
 * testService.js
 *
 * Backend base: /api/v1/tests
 *
 * PUBLIC:
 *   GET  /api/v1/tests/course/:course_id → tests by course
 *   GET  /api/v1/tests/:id/full        → full test with questions
 *   GET  /api/v1/tests/:id             → single test
 *
 * STUDENT:
 *   POST /api/v1/attempts/:testId/start → start exam attempt
 *   POST /api/v1/attempts/submit      → submit exam
 *   GET  /api/v1/attempts/:attemptId/detail → get detailed result
 *
 * ADMIN ONLY:
 *   POST /api/v1/tests/create          → create test
 *   PUT  /api/v1/tests/update/:id       → update test
 *   DELETE /api/v1/tests/delete/:id     → delete test
 */

const testService = {
    // Public
    getByCourseId: (courseId) => api.get(`/tests/course/${courseId}`),
    getTestFull: (id) => api.get(`/tests/${id}/full`),
    getById: (id) => api.get(`/tests/${id}`),

    // Student - Updated to match API flow
    startAttempt: (testId) => api.post(`/attempts/${testId}/start`),
    submitExam: (data) => api.post("/attempts/submit", data),
    getAttemptDetail: (attemptId) => api.get(`/attempts/${attemptId}/detail`),
    getAttemptHistory: (testId) => api.get(`/attempts/${testId}/history`),
    getMyAttempts: () => api.get("/attempts/my-attempts"),
    getStudentAttempts: () => api.get("/attempts/my-attempts"),

    // Admin only
    create: (data) => api.post("/tests/create", data),
    update: (id, data) => api.put(`/tests/update/${id}`, data),
    delete: (id) => api.delete(`/tests/delete/${id}`),
};

export default testService;
