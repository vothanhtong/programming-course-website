import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ProfilePage from './pages/Profile/ProfilePage';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import FloatingContact from './components/FloatingContact/FloatingContact';

const App: React.FC = () => (
  <>
    <FloatingContact />
    <Routes>
      <Route path="/"                  element={<HomePage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register"          element={<RegisterPage />} />
      <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
      <Route path="/reset-password"    element={<ResetPasswordPage />} />
      <Route path="/profile"           element={<ProfilePage />} />
      <Route path="/courses/:slug"     element={<CourseDetail />} />
      {/* Fallback */}
      <Route path="*"                  element={<HomePage />} />
    </Routes>
  </>
);

export default App;
