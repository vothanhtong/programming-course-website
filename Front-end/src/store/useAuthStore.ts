import { create } from 'zustand';
import authApi, { Student } from '../api/authApi';
import { setAccessToken } from '../api/axiosClient';

interface AuthState {
  student: Student | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  student: null,
  loading: true,

  checkAuth: async () => {
    try {
      const res = await authApi.getMe();
      set({ student: res.student, loading: false });
    } catch {
      setAccessToken(null);
      set({ student: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.token);
    set({ student: res.student });
  },

  register: async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    setAccessToken(res.token);
    set({ student: res.student });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore logout errors
    }
    setAccessToken(null);
    set({ student: null });
  },

  updateProfile: async (data) => {
    await authApi.updateProfile(data);
    const fresh = await authApi.getMe();
    set({ student: fresh.student });
  },
}));
