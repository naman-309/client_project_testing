import api from "./api";

/**
 * progressService.js
 *
 * Base: /api/v1/progress
 *
 * STUDENT:
 *   GET  /api/v1/progress/:courseId  → course ka pura progress
 *   POST /api/v1/progress            → lesson progress update (upsert)
 */

const progressService = {
    // GET /progress/:courseId
    // Returns: [{ lesson_id, is_completed, watch_time, last_watched }]
    getCourseProgress: (courseId) => api.get(`/progress/${courseId}`),

    // POST /progress
    // Body: { lesson_id, is_completed, watch_time }
    updateLessonProgress: (data) => api.post("/progress", data),
};

export default progressService;
