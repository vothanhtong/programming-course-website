import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FloatingContact from './components/ui/FloatingContact/FloatingContact';
import { useAuthStore } from './store/useAuthStore';

// Route-level code splitting — each page loads only when navigated to
const HomePage          = lazy(() => import('./pages/HomePage/HomePage'));
const LoginPage         = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const ProfilePage       = lazy(() => import('./pages/Profile/ProfilePage'));
const CourseDetail      = lazy(() => import('./pages/CourseDetail/CourseDetail'));
const StudentDashboard  = lazy(() => import('./pages/Dashboard/StudentDashboard'));
const MyCoursesPage     = lazy(() => import('./pages/Dashboard/MyCoursesPage'));
const MockPaymentGateway= lazy(() => import('./pages/MockPaymentGateway'));
const PaymentResult     = lazy(() => import('./pages/PaymentResult'));
const NotFoundPage      = lazy(() => import('./pages/NotFound/NotFoundPage'));
const UnauthorizedPage  = lazy(() => import('./pages/NotFound/UnauthorizedPage'));
const ForbiddenPage     = lazy(() => import('./pages/NotFound/ForbiddenPage'));
const ServerErrorPage   = lazy(() => import('./pages/NotFound/ServerErrorPage'));

// Admin Dashboard
const AdminApp          = lazy(() => import('./admin/AdminApp'));

// Minimal full-screen fallback shown during chunk load
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#020817' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-sm" style={{ color: '#475569' }}>Đang tải...</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // BUG-13 FIX: Lắng nghe CustomEvent 'auth:unauthorized' từ axiosClient
  // Dùng React Router navigate() thay vì window.location.href — giữ SPA experience
  useEffect(() => {
    const handleUnauthorized = (e: Event) => {
      const detail = (e as CustomEvent<{ redirectTo: string }>).detail;
      navigate(detail.redirectTo, { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  return (
    <>
    <FloatingContact />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"                element={<HomePage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/courses/:slug"   element={<CourseDetail />} />
        <Route path="/dashboard"       element={<StudentDashboard />} />
        <Route path="/my-courses"      element={<MyCoursesPage />} />
        <Route path="/mock-payment"    element={<MockPaymentGateway />} />
        <Route path="/payment-result"  element={<PaymentResult />} />
        
        {/* Admin Route */}
        <Route path="/admin/*"         element={<AdminApp />} />
        
        {/* Error Pages */}
        <Route path="/401"             element={<UnauthorizedPage />} />
        <Route path="/403"             element={<ForbiddenPage />} />
        <Route path="/500"             element={<ServerErrorPage />} />
        <Route path="*"                element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </>
  );
};

export default App;
