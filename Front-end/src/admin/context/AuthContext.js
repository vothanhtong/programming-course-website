import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!token) { setLoading(false); return; }

    // Verify token với server thay vì chỉ đọc localStorage
    adminApi.getProfile()
      .then(res => setAdmin(res.admin))
      .catch(() => {
        // Token hết hạn hoặc không hợp lệ — xóa
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_INFO);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (userName, password) => {
    const res = await adminApi.login({ userName, password });
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, res.token);
    setAdmin(res.admin);
    return res;
  };

  const logout = async () => {
    try { await adminApi.logout(); } catch {}
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_INFO);
    setAdmin(null);
  };

  const updateProfile = async (data) => {
    const res = await adminApi.updateProfile(data);
    setAdmin(prev => ({ ...prev, ...res.admin }));
    return res;
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
