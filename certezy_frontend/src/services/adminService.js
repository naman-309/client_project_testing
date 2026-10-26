import api from "./api";

/**
 * adminService.js
 *
 * Backend base URL is set to /api/v1 via VITE_API_BASE_URL.
 * All endpoint paths here are relative to baseURL (no /v1 prefix).
 */

const adminService = {
    // Dashboard & Revenue Stats
    getDashboardStats: async () => {
        try {
            return await api.get("/admin/dashboard");
        } catch (error) {
            try {
                return await api.get("/admin/stats");
            } catch (fallbackError) {
                console.error("Dashboard stats endpoints failed, attempting fallback:", fallbackError);
                try {
                    const [usersResponse, coursesResponse] = await Promise.all([
                        api.get("/auth/users/all"),
                        api.get("/courses"),
                    ]);
                    const users = usersResponse.data?.data?.users || usersResponse.data?.data || [];
                    const courses = coursesResponse.data?.data?.courses || coursesResponse.data?.data || [];
                    return {
                        data: {
                            totalUsers: users.length,
                            activeUsers: users.filter((u) => u.status === "active" || u.is_active === 1)
                                .length,
                            totalCourses: courses.length,
                            publishedCourses: courses.filter((c) => c.status === "published").length,
                            totalRevenue: 0,
                            thisMonthRevenue: 0,
                            pendingReviews: 0,
                            pendingPayments: 0,
                        },
                    };
                } catch {
                    return {
                        data: {
                            totalUsers: 0,
                            activeUsers: 0,
                            totalCourses: 0,
                            publishedCourses: 0,
                            totalRevenue: 0,
                            thisMonthRevenue: 0,
                            pendingReviews: 0,
                            pendingPayments: 0,
                        },
                    };
                }
            }
        }
    },

    getRevenueOverview: async () => {
        return api.get("/payments/admin/revenue");
    },

    // Users
    getUsers: (params = {}) => api.get("/auth/users/all", { params }),
    getUserById: (id) => api.get(`/auth/users/${id}`),
    updateUserStatus: (id, data) => api.put(`/auth/users/${id}/status`, data),

    // Sub-Admin Management
    createSubAdmin: (data) => api.post("/admin/sub-admins/create", data),

    // Permissions Management
    getPermissions: (userId) => api.get(`/admin/permissions/${userId}`),
    updatePermissions: (userId, data) => api.put(`/admin/permissions/${userId}`, data),
    deletePermissions: (userId) => api.delete(`/admin/permissions/${userId}`),

    // Courses
    getCourses: (params = {}) => api.get("/courses", { params }),
    getCourseById: (id) => api.get(`/courses/${id}`),
    toggleCourseStatus: async (id) => {
        console.log("Toggle course status for:", id);
    },
    toggleCourseFeatured: async (id) => {
        console.log("Toggle featured for:", id);
    },

    // Categories
    getCategories: () => api.get("/categories"),
    createCategory: (data) => api.post("/categories/create", data),
    updateCategory: (id, data) => api.put(`/categories/update/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/delete/${id}`),

    // Payments
    getPayments: (params = {}) => api.get("/payments/admin/all", { params }),
    getRecentPayments: (limit = 10) => api.get(`/payments/admin/all?limit=${limit}`),
    updatePaymentStatus: async (id, status) => {
        console.log("Update payment status:", id, status);
        return { success: true };
    },

    // Reviews
    getPendingReviews: (limit = 10) => api.get(`/reviews/admin/pending?limit=${limit}`),
    getAllReviews: (params = {}) => api.get("/reviews/admin/all", { params }),
    approveReview: (id) => api.put(`/reviews/${id}/approval`, { is_approved: 1 }),
    rejectReview: (id) => api.put(`/reviews/${id}/approval`, { is_approved: 0 }),

    // Enrollments
    getEnrollments: (params = {}) => api.get("/enrollments/admin/all", { params }),
    updateEnrollment: (id, data) => {
        console.log("Update enrollment:", id, data);
        return Promise.resolve({ success: true });
    },

    // Discounts
    getDiscounts: () => api.get("/discounts"),
    createDiscount: (data) => api.post("/discounts", data),
    updateDiscount: (id, data) => api.put(`/discounts/${id}`, data),
    deleteDiscount: (id) => api.delete(`/discounts/${id}`),

    // Certificates
    getCertificates: () => api.get("/certificates/admin/all"),
    issueCertificate: (data) => api.post("/certificates/issue", data),
    revokeCertificate: (id) => api.put(`/certificates/${id}/revoke`),

    // Contact Messages
    getContactMessages: (params = {}) => api.get("/contact", { params }),
    markMessageAsRead: (id) => api.put(`/contact/${id}/status`, { status: "read" }),
    replyToMessage: (id, data) => {
        console.log("Reply to message:", id, data);
        return Promise.resolve({ success: true });
    },

    // Settings
    getSettings: () => Promise.resolve({ data: { settings: {} } }),
    updateSettings: (data) => {
        console.log("Update settings:", data);
        return Promise.resolve({ success: true });
    },

    // Reports
    getRevenueReport: () => Promise.resolve({ data: { report: [] } }),
    getUserReport: () => Promise.resolve({ data: { report: [] } }),
    getCourseReport: () => Promise.resolve({ data: { report: [] } }),
    exportData: (type, params = {}) => {
        console.log("Export data:", type, params);
        return Promise.resolve(new Blob());
    },
};

export default adminService;
