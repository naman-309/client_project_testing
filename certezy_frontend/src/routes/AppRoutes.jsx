import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, Link, Navigate } from "react-router-dom";

import NavBarIndex from "@/components/layout/Navbar/NavBarIndex";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { ADMIN_ROLES, ROUTES } from "@/config/app";

// ── Pages (code-split per route) ─────────────────────────
// Public
const Home = lazy(() => import("@/pages/public/HomePage/Home"));
const About = lazy(() => import("@/pages/public/AboutCompany/About"));
const CoursesPage = lazy(() => import("@/pages/public/Courses/CoursesPage"));
const CourseDetailPage = lazy(() => import("@/pages/public/CourseDetail/CourseDetailIndex"));
const ContactPagePublic = lazy(() => import("@/pages/contact/ContactPagePublic"));

// Auth
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const OAuthCallback = lazy(() => import("@/pages/auth/OAuthCallback"));
const ChangePasswordPage = lazy(() => import("@/pages/auth/ChangePasswordPage"));

// Student
const StudentLayout = lazy(() => import("@/components/layout/StudentLayout"));
const DashboardPage = lazy(() => import("@/pages/student/DashboardPage"));
const MyCoursesPage = lazy(() => import("@/pages/student/MyCoursesPage"));
const CertificatesPage = lazy(() => import("@/pages/student/CertificatesPage"));
const PaymentHistoryPage = lazy(() => import("@/pages/student/PaymentHistoryPage"));
const ProfilePage = lazy(() => import("@/pages/student/ProfilePage"));
const CoursePlayerPage = lazy(() => import("@/pages/student/CoursePlayerPage"));
const ExamInterface = lazy(() => import("@/pages/student/ExamInterface"));
const CheckoutPage = lazy(() => import("@/pages/student/CheckoutPage/PaymentIndex"));

// Admin
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AdminCoursesPage = lazy(() => import("@/pages/admin/CoursesPage"));
const CurriculumPage = lazy(() => import("@/pages/admin/CurriculumPage"));
const CategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const ReviewsManagementPage = lazy(() => import("@/pages/admin/ReviewsManagementPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const EnrollmentsPage = lazy(() => import("@/pages/admin/EnrollmentsPage"));
const DiscountsPage = lazy(() => import("@/pages/admin/DiscountsPage"));
const AdminCertificatesPage = lazy(() => import("@/pages/admin/CertificatesPage"));
const ContactPage = lazy(() => import("@/pages/admin/ContactPage"));
const TestsPage = lazy(() => import("@/pages/admin/TestsPage"));
const QuestionsPage = lazy(() => import("@/pages/admin/QuestionsPage"));

// ── Layout shells ────────────────────────────────────────
/** Public marketing pages: navbar + footer. Never requires login. */
function PublicShell() {
    return (
        <>
            <NavBarIndex />
            <Outlet />
            <Footer />
        </>
    );
}

/** Auth, student and checkout pages: footer only (own headers). */
function FooterShell() {
    return (
        <>
            <Outlet />
            <Footer />
        </>
    );
}

function PageLoader() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
    );
}

function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
                <p className="text-[48px] font-extrabold text-primary">404</p>
                <p className="text-[16px] text-text-secondary mt-2">Page not found</p>
                <Link to={ROUTES.HOME} className="inline-block mt-4 text-[14px] font-semibold text-primary">
                    ← Back to home
                </Link>
            </div>
        </div>
    );
}

const studentOnly = (element) => <ProtectedRoute allowedRoles={["student"]}>{element}</ProtectedRoute>;

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ── PUBLIC (no login required) ── */}
                <Route element={<PublicShell />}>
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route path={ROUTES.COURSES} element={<CoursesPage />} />
                    <Route path="/courses/:slug" element={<CourseDetailPage />} />
                    <Route path={ROUTES.CONTACT} element={<ContactPagePublic />} />
                    <Route path={ROUTES.ABOUT} element={<About />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<FooterShell />}>
                    {/* ── AUTH ── */}
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute skipFirstLoginCheck>
                                <ChangePasswordPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ── STUDENT (sidebar layout) ── */}
                    <Route path="/student" element={studentOnly(<StudentLayout />)}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="my-courses" element={<MyCoursesPage />} />
                        <Route path="certificates" element={<CertificatesPage />} />
                        <Route path="payments" element={<PaymentHistoryPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="course/:courseId/exam/:testId" element={<ExamInterface />} />
                    </Route>

                    {/* ── CHECKOUT ── */}
                    <Route path={ROUTES.CHECKOUT} element={studentOnly(<CheckoutPage />)} />
                </Route>

                {/* ── COURSE PLAYER (full screen, no sidebar/footer) ── */}
                <Route path="/student/course/:courseId/learn" element={studentOnly(<CoursePlayerPage />)} />

                {/* ── ADMIN ── */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="courses" element={<AdminCoursesPage />} />
                    <Route path="courses/:courseId/curriculum" element={<CurriculumPage />} />
                    <Route path="courses/:courseId/tests" element={<TestsPage />} />
                    <Route path="tests/:testId/questions" element={<QuestionsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="reviews" element={<ReviewsManagementPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="enrollments" element={<EnrollmentsPage />} />
                    <Route path="discounts" element={<DiscountsPage />} />
                    <Route path="certificates" element={<AdminCertificatesPage />} />
                    <Route path="contact" element={<ContactPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
