import api from "./api";

/**
 * attemptService.js
 *
 * Base: /api/v1/attempts
 *
 * STUDENT:
 *   POST /api/v1/attempts/:testId/start       → test start karo
 *   POST /api/v1/attempts/submit              → test submit karo
 *   GET  /api/v1/attempts/:testId/history     → ek test ki history
 *   GET  /api/v1/attempts/:attemptId/detail   → attempt ka detail (answers)
 */

const attemptService = {
    // Test start karo
    startAttempt: (testId) => api.post(`/attempts/${testId}/start`),

    // Test submit karo
    submitAttempt: (data) => api.post("/attempts/submit", data),

    // Ek test ki attempt history
    getAttemptHistory: (testId) => api.get(`/attempts/${testId}/history`),

    // Single attempt ka full detail (answers + explanations)
    getAttemptDetail: (attemptId) => api.get(`/attempts/${attemptId}/detail`),

    // All attempts of current logged-in student
    getMyAttempts: () => api.get("/attempts/my-attempts"),
};

export default attemptService;
