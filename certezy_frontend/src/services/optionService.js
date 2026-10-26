import api from "./api";

/**
 * optionService.js
 *
 * Backend base: /api/v1/options
 *
 * PUBLIC:
 *   GET  /api/v1/options/question/:question_id → options by question
 *
 * ADMIN ONLY:
 *   POST /api/v1/options/create          → create option
 *   POST /api/v1/options/bulk/create     → bulk create options
 *   PUT  /api/v1/options/update/:id     → update option
 *   DELETE /api/v1/options/delete/:id   → delete option
 */

const optionService = {
    // Public
    getByQuestionId: (questionId) => api.get(`/options/question/${questionId}`),

    // Admin only
    create: (data) => api.post("/options/create", data),
    bulkCreate: (data) => api.post("/options/bulk/create", data),
    update: (id, data) => api.put(`/options/update/${id}`, data),
    delete: (id) => api.delete(`/options/delete/${id}`),
};

export default optionService;
