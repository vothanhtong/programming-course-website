import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import authApi, { Student } from '../api/authApi';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface AuthContextType {
  student: Student | null;
  loading: boolean;
  login:         (email: string, password: string) => Promise<void>;
  register:      (fullName: string, email: string, password: string) => Promise<void>;
  logout:        () => void;
  updateProfile: (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.STUDENT_TOKEN);
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then(res => setStudent(res.student))
      .catch(() => localStorage.removeItem(STORAGE_KEYS.STUDENT_TOKEN))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem(STORAGE_KEYS.STUDENT_TOKEN, res.token);
    setStudent(res.student);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const res = await authApi.register({ fullName, email, password });
    localStorage.setItem(STORAGE_KEYS.STUDENT_TOKEN, res.token);
    setStudent(res.student);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.STUDENT_TOKEN);
    setStudent(null);
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) => {
    await authApi.updateProfile(data);
    // Re-fetch full student so enrolledCourses (populated) is preserved in context
    const fresh = await authApi.getMe();
    setStudent(fresh.student);
  }, []);

  // Memoize context value — prevents all consumers from re-rendering when
  // an unrelated parent state changes; only re-renders when student/loading changes
  const value = useMemo<AuthContextType>(
    () => ({ student, loading, login, register, logout, updateProfile }),
    [student, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
