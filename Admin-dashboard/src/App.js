import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import { darkTheme } from './theme';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Enrollments from './pages/Enrollments';
import Reviews from './pages/Reviews';
import Categories from './pages/Categories';
import Students from './pages/Students';
import AdminProfile from './pages/AdminProfile';
import Messages from './pages/Messages';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<Dashboard />} />
        <Route path="courses"     element={<Courses />} />
        <Route path="students"    element={<Students />} />
        <Route path="enrollments" element={<Enrollments />} />
        <Route path="reviews"     element={<Reviews />} />
        <Route path="categories"  element={<Categories />} />
        <Route path="messages"    element={<Messages />} />
        <Route path="profile"     element={<AdminProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <ConfigProvider locale={viVN} theme={darkTheme}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
