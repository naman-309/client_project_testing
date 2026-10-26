// src/services/contactService.js

import api from "./api";

/**
 * contactService.js
 *
 * Backend base: /api/v1/contact
 *
 * PUBLIC (optional auth — logged in ho toh user_id auto link):
 *   POST  /api/v1/contact          → contact form submit
 *
 * ADMIN ONLY:
 *   GET   /api/v1/contact          → sab contacts (paginated, filter by status)
 *   GET   /api/v1/contact/:id      → single contact
 *   PUT   /api/v1/contact/:id/status → status update (new → read → resolved)
 */

const contactService = {
    // Public
    submit: (data) => api.post("/contact/create", data),

    // Admin only
    getAll: (params) => api.get("/contact", { params }), // ?status=new&page=1&limit=20
    getById: (id) => api.get(`/contact/${id}`),
    updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
};

export default contactService;
