import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useAdminStore } from '../store/useAdminStore';
import { darkTheme } from './theme';
import AdminLayout from './components/Layout/AdminLayout';

// Eagerly load Login (always the first page for unauthenticated users)
import Login from './pages/Login';

// Lazy-load all dashboard pages — each loads only when navigated to.
// Ant Design's large vendor bundle means this saves ~300KB on initial load.
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Courses      = lazy(() => import('./pages/Courses'));
const Enrollments  = lazy(() => import('./pages/Enrollments'));
const Reviews      = lazy(() => import('./pages/Reviews'));
const Categories   = lazy(() => import('./pages/Categories'));
const Students     = lazy(() => import('./pages/Students'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const Messages     = lazy(() => import('./pages/Messages'));
const Quizzes      = lazy(() => import('./pages/Quizzes'));

// Minimal spinner shown while a lazy chunk loads
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
    <Spin size="large" />
  </div>
);

// BUG-07 FIX: Thêm TypeScript type cho children prop
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAdminStore();
  if (loading) return <PageLoader />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { admin, checkAuth } = useAdminStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="login" element={admin ? <Navigate to="/admin" replace /> : <Login />} />
        <Route
          path=""
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<Dashboard />} />
          <Route path="courses"       element={<Courses />} />
          <Route path="students"      element={<Students />} />
          <Route path="enrollments"   element={<Enrollments />} />
          <Route path="reviews"       element={<Reviews />} />
          <Route path="categories"    element={<Categories />} />
          <Route path="quizzes"       element={<Quizzes />} />
          <Route path="messages"      element={<Messages />} />
          <Route path="profile"       element={<AdminProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
};
const App = () => (
  <ConfigProvider locale={viVN} theme={darkTheme}>
    <AppRoutes />
  </ConfigProvider>
);

export default App;
