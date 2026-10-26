import api from "./api";

/**
 * discountService.js
 *
 * Backend base: /api/v1/discounts
 *
 * PUBLIC:
 *   GET  /api/v1/discounts              → all active discounts
 *   GET  /api/v1/discounts/:code        → discount by code
 *
 * ADMIN ONLY:
 *   POST /api/v1/discounts/             → create discount
 *   GET  /api/v1/discounts/admin/all    → all discounts (admin view)
 *   PUT  /api/v1/discounts/:id          → update discount
 *   DELETE /api/v1/discounts/:id        → delete discount
 */

const discountService = {
    // Public
    getAll: () => api.get("/discounts"),
    getByCode: (code) => api.get(`/discounts/${code}`),
    verifyToken: (token) => api.get(`/discounts/verify/${token}`),

    // Admin only
    create: (data) => api.post("/discounts", data),
    createDiscountLink: (data) => api.post("/discounts", data),
    getAllAdmin: () => api.get("/discounts"),
    update: (id, data) => api.put(`/discounts/${id}`, data),
    delete: (id) => api.delete(`/discounts/${id}`),
};

export default discountService;
