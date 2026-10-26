/**
 * navbar.data.js — Navbar Static Data
 *
 * Sirf static links hain yahan.
 * Categories yahan nahi hain — MegaMenu.jsx mein
 * real API se fetch hongi: GET /api/v1/categories
 */

// ── Desktop nav links ──────────────────────────────────────
export const NAV_LINKS = [
    { label: "All Courses", to: "/courses" },
    { label: "More", to: null }, // dropdown — navbar.data se handle
];

// ── "More" dropdown items ──────────────────────────────────
export const MORE_ITEMS = [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact-us" },
    { divider: true },
    { label: "Help Center", to: "/help" },
];

// ── Student avatar dropdown ────────────────────────────────
export const STUDENT_MENU_ITEMS = [
    { label: "My Profile", to: "/student/profile" },
    { label: "My Learning", to: "/student/my-courses" },
    { label: "Certificates", to: "/student/certificates" },
    { label: "Payment History", to: "/student/payments" },
    { divider: true },
    { label: "Logout", to: "/logout", danger: true },
];
