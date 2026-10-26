import api from "./api";

/**
 * paymentService.js
 *
 * Base: /api/v1/payments
 *
 * STUDENT:
 *   GET  /api/v1/payments/history           → payment history (student only)
 *   POST /api/v1/payments/razorpay/create-order
 *   POST /api/v1/payments/razorpay/verify
 *   POST /api/v1/payments/paypal/create-order
 *   POST /api/v1/payments/paypal/capture
 *
 * ADMIN:
 *   GET  /api/v1/payments/admin/all       → all payments with filters
 */

const paymentService = {
    getMyPayments: () => api.get("/payments/history"),

    // Razorpay
    razorpayCreateOrder: (data) => api.post("/payments/razorpay/create-order", data),
    razorpayVerify: (data) => api.post("/payments/razorpay/verify", data),

    // PayPal
    paypalCreateOrder: (data) => api.post("/payments/paypal/create-order", data),
    paypalCapture: (data) => api.post("/payments/paypal/capture", data),

    // Admin endpoints
    getAllPayments: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append("status", params.status);
        if (params.method) queryParams.append("method", params.method);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        if (params.currency) queryParams.append("currency", params.currency);

        const url = `/payments/admin/all${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        return api.get(url);
    },

    getRecentPayments: (limit = 10) => {
        return api.get(`/payments/admin/all?limit=${limit}`);
    },

    // Revenue stats
    getRevenueStats: () => api.get("/payments/admin/revenue"),
};

export default paymentService;
