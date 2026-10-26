# 🎓 Certezy — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=for-the-badge)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)

**Production-ready frontend for the Certezy online learning platform.**
Courses · Practice Tests · Certifications · Payments · Admin Panel

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Routes](#-routes)
- [Redux State](#-redux-state)
- [API Services](#-api-services)
- [Auth Flow](#-auth-flow)
- [Role-Based Access](#-role-based-access)
- [Key Features](#-key-features)
- [API Endpoints](#-api-endpoints)
- [Component Guide](#-component-guide)
- [Code Rules](#-code-rules)
- [Pages Overview](#-pages-overview)

---

## 🧭 Overview

Certezy frontend is a full-featured React SPA connected to the Certezy backend API. It supports three user roles — **Student**, **Sub-Admin**, and **Admin** — each with their own protected dashboard and experience.

**Key experiences:**
- Students browse, purchase, and consume courses + practice tests
- Auto-generated certificates on course completion
- Admin manages content, users, discounts, and payments
- Fully responsive UI with shadcn/ui + Tailwind

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite 5 | Fast SPA + HMR |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Components | shadcn/ui | Accessible UI components |
| Icons | Lucide React | Clean icon set |
| State | Redux Toolkit | Global state management |
| Routing | React Router DOM v6 | Client-side routing |
| HTTP | Axios | API calls + interceptors |
| Forms | React Hook Form + Zod | Validation |
| Tables | TanStack Table v8 | Admin data tables |
| Charts | Recharts | Admin dashboard charts |
| Video | React Player | Course video player |

---

## 🗂 Folder Structure

```
certezy-frontend/
│
├── public/
│   └── logo.svg
│
├── src/
│   │
│   ├── app/                              # Redux store
│   │   ├── store.js                      # configureStore
│   │   └── rootReducer.js                # combineReducers
│   │
│   ├── features/                         # Redux slices
│   │   ├── auth/
│   │   │   └── authSlice.js              # user, token, role, isLoggedIn
│   │   ├── course/
│   │   │   └── courseSlice.js            # filters, search, currentCourse
│   │   ├── cart/
│   │   │   └── cartSlice.js              # selectedCourse, discountToken, finalPrice
│   │   └── notification/
│   │       └── notificationSlice.js      # notifications[], unreadCount
│   │
│   ├── services/                         # All API calls
│   │   ├── api.js                        # Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   ├── enrollmentService.js
│   │   ├── testService.js
│   │   ├── paymentService.js
│   │   ├── discountService.js
│   │   ├── certificateService.js
│   │   ├── reviewService.js
│   │   ├── notificationService.js
│   │   ├── contactService.js
│   │   └── adminService.js
│   │
│   ├── pages/
│   │   │
│   │   ├── public/                       # No auth required
│   │   │   ├── HomePage.jsx
│   │   │   ├── CoursesPage.jsx           # Listing + filters + search
│   │   │   ├── CourseDetailPage.jsx      # Slug-based course page
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── student/                      # Auth: role = student
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MyCoursesPage.jsx
│   │   │   ├── CoursePlayerPage.jsx      # Video/article/quiz player
│   │   │   ├── TestPage.jsx              # Attempt a test
│   │   │   ├── TestResultPage.jsx        # Score + answer explanations
│   │   │   ├── CheckoutPage.jsx          # Razorpay payment
│   │   │   ├── CertificatesPage.jsx
│   │   │   ├── PaymentHistoryPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   └── admin/                        # Auth: role = admin / sub_admin
│   │       ├── DashboardPage.jsx
│   │       ├── UsersPage.jsx
│   │       ├── SubAdminsPage.jsx
│   │       ├── CategoriesPage.jsx
│   │       ├── CoursesPage.jsx
│   │       ├── CourseFormPage.jsx        # Create / Edit course
│   │       ├── SectionsPage.jsx          # Manage sections + lessons
│   │       ├── TestsPage.jsx
│   │       ├── TestFormPage.jsx          # Create / Edit test + questions
│   │       ├── PaymentsPage.jsx
│   │       ├── EnrollmentsPage.jsx
│   │       ├── ContactPage.jsx
│   │       ├── DiscountsPage.jsx
│   │       └── CertificatesPage.jsx
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.jsx                # Public navbar
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx               # Admin sidebar with nav links
│   │   │   ├── StudentLayout.jsx         # Student pages wrapper
│   │   │   └── AdminLayout.jsx           # Admin pages wrapper
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ChangePasswordForm.jsx    # First-login sub-admin flow
│   │   │
│   │   ├── course/
│   │   │   ├── CourseCard.jsx            # Used in listings
│   │   │   ├── CourseFilters.jsx         # Category, price, rating filters
│   │   │   ├── CourseSearch.jsx          # Debounced search input
│   │   │   ├── CourseSyllabus.jsx        # Sections + lessons accordion
│   │   │   └── CourseReviews.jsx         # Ratings + comments list
│   │   │
│   │   ├── player/
│   │   │   ├── VideoPlayer.jsx           # React Player wrapper
│   │   │   ├── ArticleViewer.jsx         # Markdown/HTML content
│   │   │   └── LessonSidebar.jsx         # Lesson nav + progress indicator
│   │   │
│   │   ├── test/
│   │   │   ├── QuestionCard.jsx          # Single/multi/true-false question
│   │   │   ├── TestTimer.jsx             # Countdown timer
│   │   │   └── ResultSummary.jsx         # Score breakdown + explanations
│   │   │
│   │   ├── admin/
│   │   │   ├── StatsCard.jsx             # Dashboard metric card
│   │   │   ├── DataTable.jsx             # TanStack Table wrapper (reusable)
│   │   │   ├── CourseForm.jsx
│   │   │   ├── SectionForm.jsx
│   │   │   ├── LessonForm.jsx
│   │   │   ├── QuestionForm.jsx
│   │   │   └── DiscountForm.jsx
│   │   │
│   │   └── shared/
│   │       ├── ProtectedRoute.jsx        # Auth + role guard
│   │       ├── Loader.jsx                # Full-page spinner
│   │       ├── EmptyState.jsx            # No data illustration
│   │       ├── Pagination.jsx            # Page controls
│   │       ├── ConfirmDialog.jsx         # Delete confirmation modal
│   │       └── Toast.jsx                 # shadcn toast wrapper
│   │
│   ├── hooks/
│   │   ├── useAuth.js                    # Shortcut to auth Redux state
│   │   ├── useDebounce.js                # Debounce for search inputs
│   │   └── usePagination.js              # Page/limit state helper
│   │
│   ├── utils/
│   │   ├── formatDate.js                 # Date display helpers
│   │   ├── formatPrice.js                # ₹ / $ formatting
│   │   └── constants.js                  # ROLES, STATUS enums, etc.
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx                 # All routes in one place
│   │
│   ├── index.css                         # Tailwind directives
│   └── main.jsx                          # Entry point
│
├── .env
├── .env.example
├── tailwind.config.js
├── vite.config.js
├── jsconfig.json                         # Path aliases (@/)
└── package.json
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/saketdix-app/certezy_frontend.git


# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your values (see below)

# 4. Initialize shadcn/ui
npx shadcn-ui@latest init

# 5. Start dev server
npm run dev

# 6. Build for production
npm run build
```

---

## ⚙️ Environment Variables

```env
# Backend API
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay (public key only — never put secret here)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx

# OAuth (if Google login button on frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# App
VITE_APP_NAME=Certezy
VITE_APP_URL=http://localhost:5173
```

> ⚠️ **Rule:** Only `VITE_` prefix variables are exposed to browser. Never put secrets here.

---

## 🛣️ Routes

### Public (No Auth)
```
/                          → HomePage
/courses                   → CoursesPage  (filters + search)
/courses/:slug             → CourseDetailPage
/login                     → LoginPage
/register                  → RegisterPage
```

### Student (Auth required — role: student)
```
/student/dashboard         → Dashboard
/student/my-courses        → My enrolled courses
/student/learn/:courseId   → CoursePlayerPage (video/article/quiz)
/student/test/:testId      → TestPage (attempt)
/student/result/:attemptId → TestResultPage
/student/checkout          → CheckoutPage
/student/certificates      → My certificates
/student/payments          → Payment history
/student/notifications     → Notifications
/student/profile           → Profile settings
```

### Admin (Auth required — role: admin / sub_admin)
```
/admin/dashboard           → Stats + overview
/admin/users               → All students list
/admin/categories          → Category CRUD
/admin/courses             → Courses list
/admin/courses/new         → Create course
/admin/courses/:id/edit    → Edit course
/admin/courses/:id/content → Manage sections + lessons
/admin/enrollments         → Student enrollment tracking
/admin/payments            → All transactions + revenue
/admin/contact             → Customer support tickets
/admin/discounts           → Discount links management
/admin/certificates        → Issued certificates
```

---

## 🗃️ Redux State

### `authSlice`
```js
{
  user: { id, name, email, avatar, role },
  accessToken: "...",
  isLoggedIn: true,
  isFirstLogin: false      // for sub-admin password change flow
}
```

### `courseSlice`
```js
{
  filters: { category, minPrice, maxPrice, rating, status },
  searchQuery: "",
  currentCourse: { ...courseDetail },
  page: 1
}
```

### `cartSlice`
```js
{
  course: { id, title, price, thumbnail },
  discountToken: "UUID or null",
  finalPrice: 0
}
```

### `notificationSlice`
```js
{
  notifications: [],
  unreadCount: 0
}
```

---

## 🌐 API Services

Every service file follows this pattern:

```js
// services/courseService.js
import api from './api';

const courseService = {
  getAll:    (params) => api.get('/courses', { params }),
  getBySlug: (slug)   => api.get(`/courses/${slug}`),
  create:    (data)   => api.post('/courses', data),
  update:    (id, data) => api.put(`/courses/${id}`, data),
  delete:    (id)     => api.delete(`/courses/${id}`),
};

export default courseService;
```

### Axios Instance (`services/api.js`)
```js
// Auto attaches Authorization header
// Auto refreshes token on 401
// Redirects to /login on refresh failure
```

---

## 🔐 Auth Flow

```
REGISTER
Student fills form → POST /auth/register
→ Redirect to /login with success toast

LOGIN
POST /auth/login → gets accessToken + refreshToken
→ Save accessToken in Redux (memory)
→ Save refreshToken in httpOnly cookie (handled by backend)
→ Redirect based on role:
   student   → /student/dashboard
   sub_admin → /admin/dashboard (+ force password change if first login)
   admin     → /admin/dashboard

TOKEN REFRESH
Axios interceptor catches 401
→ POST /auth/refresh automatically
→ Retry original request with new token
→ If refresh fails → logout + redirect /login

LOGOUT
POST /auth/logout → clear Redux state → redirect /login
```

---

## 👥 Role-Based Access

`ProtectedRoute.jsx` wraps every secured route:

```jsx
// Usage in AppRoutes.jsx
<ProtectedRoute allowedRoles={['student']}>
  <MyCoursesPage />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['admin', 'sub_admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

**What it checks:**
1. Is user logged in? → else redirect `/login`
2. Does role match `allowedRoles`? → else redirect `/unauthorized`
3. Is sub-admin's first login? → force redirect to change-password

---

## 🧩 Component Guide

### `DataTable.jsx` — reusable for all admin tables
```jsx
<DataTable
  columns={columns}
  data={users}
  isLoading={loading}
  pagination={pagination}
  onPageChange={setPage}
/>
```

### `ConfirmDialog.jsx` — for all delete actions
```jsx
<ConfirmDialog
  open={open}
  title="Delete Course?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
/>
```

### `useDebounce.js` — for search inputs
```js
const debouncedQuery = useDebounce(searchQuery, 400);
// API call only fires 400ms after user stops typing
```

---

## 📐 Code Rules

### 1. No direct API calls in components
```jsx
// ❌ Wrong — axios directly in component
useEffect(() => { axios.get('/courses') }, []);

// ✅ Correct — use service
useEffect(() => { courseService.getAll() }, []);
```

### 2. Redux only for global state
```js
// ❌ Wrong — put server data in Redux
dispatch(setCourses(response.data));

// ✅ Correct — local useState for server data, Redux for UI/auth state
const [courses, setCourses] = useState([]);
```

### 3. Zod schema for every form
```js
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
```

### 4. Always handle loading + error states
```jsx
if (loading) return <Loader />;
if (error)   return <EmptyState message={error} />;
```

### 5. Path aliases — always use `@/`
```js
// ❌ Wrong
import CourseCard from '../../../components/course/CourseCard';

// ✅ Correct
import CourseCard from '@/components/course/CourseCard';
```

### 6. One component per file, named export + default export both
```jsx
export function CourseCard({ course }) { ... }
export default CourseCard;
```

---

## � Key Features

### Student Experience
- **Course Discovery**: Browse, search, and filter courses by category, price, and rating
- **Interactive Learning**: Video lessons, articles, and quizzes with progress tracking
- **Assessments**: Timed MCQ tests with instant results and detailed explanations
- **Certificates**: Auto-generated certificates on course completion
- **Secure Payments**: Razorpay/PayPal integration with multiple payment methods

### Admin Dashboard
- **Analytics**: Real-time stats for revenue, users, courses, and enrollments
- **User Management**: Student and sub-admin account management
- **Content Management**: Course creation, curriculum builder, and test management
- **Financial Tracking**: Payment history, enrollment tracking, and revenue analytics
- **Support System**: Customer contact management with status tracking

### Technical Features
- **Role-Based Access**: Secure authentication with role-based routing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-Time Updates**: Live notifications and dashboard metrics
- **API Integration**: RESTful API with proper error handling
- **Performance**: Lazy loading, pagination, and optimized data fetching

---

## 🔌 API Endpoints

### Authentication
```javascript
POST /api/v1/auth/register     // Student registration
POST /api/v1/auth/login        // User login
POST /api/v1/auth/logout       // User logout
POST /api/v1/auth/refresh      // Token refresh
```

### Courses & Learning
```javascript
GET    /api/v1/courses               // List courses with filters
GET    /api/v1/courses/:slug         // Course details
POST   /api/v1/enrollments           // Enroll in course
GET    /api/v1/enrollments/my        // My enrollments
POST   /api/v1/attempts/:testId/start // Start test attempt
POST   /api/v1/attempts/submit       // Submit test
```

### Admin Management
```javascript
GET    /api/v1/payments/admin/all     // All payments
GET    /api/v1/enrollments/admin/all  // All enrollments
GET    /api/v1/contact               // Contact messages
PUT    /api/v1/contact/:id/status    // Update contact status
GET    /api/v1/users/admin           // User management
```

---

## �� Pages Overview

| Page | Auth | Description |
|---|---|---|
| HomePage | ❌ | Hero + featured courses + CTA |
| CoursesPage | ❌ | Full listing with filters, search, pagination |
| CourseDetailPage | ❌ | Syllabus, instructor, reviews, enroll CTA |
| LoginPage | ❌ | Email/password + Google/GitHub OAuth |
| RegisterPage | ❌ | Student self-registration |
| Student Dashboard | ✅ | Progress summary, recent activity |
| CoursePlayerPage | ✅ | Video/article player + lesson sidebar |
| TestPage | ✅ | Timed MCQ test with auto-submit |
| TestResultPage | ✅ | Score, correct answers, explanations |
| CheckoutPage | ✅ | Course + price + Razorpay integration |
| CertificatesPage | ✅ | Download/view earned certificates |
| Admin Dashboard | ✅ | Revenue, users, courses stats + charts |
| EnrollmentsPage | ✅ | Student enrollment tracking with progress |
| PaymentsPage | ✅ | Revenue dashboard with transaction history |
| ContactPage | ✅ | Customer support ticket management |
| DiscountsPage | ✅ | Send personalised discount links to students |
| CertificatesPage | ✅ | View and manage issued certificates |
| CourseFormPage | ✅ | Create/edit course with all fields |
| SectionsPage | ✅ | Drag-reorder sections + lessons |
| TestFormPage | ✅ | Build tests, add questions + options |

---

## 📦 NPM Packages

```bash
# Core
npm install react-router-dom @reduxjs/toolkit react-redux axios

# UI
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npx shadcn-ui@latest init
npm install lucide-react

# Forms
npm install react-hook-form zod @hookform/resolvers

# Tables + Charts
npm install @tanstack/react-table recharts

# Video + Utilities
npm install react-player
npm install date-fns                  # Date formatting

# Dev
npm install --save-dev vite @vitejs/plugin-react
```

---

## 🗺️ jsconfig.json (Path Aliases)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```js
// vite.config.js
import path from 'path';

export default {
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
}
```

---

## 🔒 Security Notes

| Rule | Implementation |
|---|---|
| Access token | Stored in Redux memory only (never localStorage) |
| Refresh token | httpOnly cookie (set by backend) |
| Sensitive routes | ProtectedRoute wrapper on every secured page |
| API base URL | Via env variable only (`VITE_API_BASE_URL`) |
| Payment key | Only Razorpay public key in frontend (`VITE_RAZORPAY_KEY_ID`) |
| Role check | Both frontend guard + backend middleware |

---

## 📈 Scalability Notes

- All lists are **paginated** — no full data dumps
- Search uses **debounce** — no API spam
- Heavy pages use **lazy loading** — `React.lazy + Suspense`
- Images use **lazy loading** — `loading="lazy"`
- Admin tables use **TanStack Table** — handles 1000+ rows

---

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

### Environment Setup
```bash
# Production environment variables
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_APP_NAME=Certezy
VITE_APP_URL=https://your-domain.com
```

### Deployment Platforms
- **Vercel**: Recommended for React apps
- **Netlify**: Static hosting with CI/CD
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

---

## 🤝 Contributing

### Development Workflow
```bash
# 1. Fork and clone
git clone https://github.com/saketdix-app/certezy_frontend.git

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Install and start
npm install
npm run dev

# 4. Make changes following code rules
# 5. Test thoroughly
# 6. Commit and push
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 7. Create Pull Request
```

### Code Style Guidelines
- Follow existing code patterns
- Use TypeScript for new files
- Write meaningful commit messages
- Test all changes before PR
- Update documentation when needed

---

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the documentation first
- Join our Discord community
- Email: support@certezy.com

---

<div align="center">

Built with ❤️ — Scalable · Accessible · Production Ready

**⭐ Star this repo if it helped you!**

</div>