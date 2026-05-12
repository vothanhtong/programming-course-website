import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authApi, { Student } from '../api/authApi';

interface AuthContextType {
  student: Student | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  register:(fullName: string, email: string, password: string) => Promise<void>;
  logout:  () => void;
  updateProfile: (data: { fullName?: string; phone?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then(res => setStudent(res.student))
      .catch(() => localStorage.removeItem('student_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('student_token', res.token);
    setStudent(res.student);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await authApi.register({ fullName, email, password });
    localStorage.setItem('student_token', res.token);
    setStudent(res.student);
  };

  const logout = () => {
    localStorage.removeItem('student_token');
    setStudent(null);
  };

  const updateProfile = async (data: { fullName?: string; phone?: string; bio?: string }) => {
    const res = await authApi.updateProfile(data);
    setStudent(res.student);
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
