import api from "./api";

/**
 * categoryService.js
 *
 * Backend base: /api/v1/categories
 *
 * PUBLIC:
 *   GET  /api/v1/categories              → sab categories
 *   GET  /api/v1/categories/slug/:slug   → slug se single category
 *   GET  /api/v1/categories/:id          → id se single category
 *
 * ADMIN ONLY:
 *   POST   /api/v1/categories/create       → create
 *   PUT    /api/v1/categories/update/:id   → update
 *   DELETE /api/v1/categories/delete/:id   → soft delete
 */
const toCategoryPayload = (data) => ({
    name: data.name,
    description: data.description || "",
    sort_order: data.sort_order || 1,
});

const categoryService = {
    getAll: () => api.get("/categories"),
    getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
    getById: (id) => api.get(`/categories/${id}`),

    create: (data) =>
        api.post("/categories/create", {
            ...toCategoryPayload(data),
            is_active: data.status === "active" ? 1 : 0,
            parent_id: data.parent_id || undefined,
        }),

    update: (id, data) => api.put(`/categories/update/${id}`, toCategoryPayload(data)),

    delete: (id) => api.delete(`/categories/delete/${id}`),
};

export default categoryService;
