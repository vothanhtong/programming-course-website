import { create } from 'zustand';
import authApi, { Student } from '../api/authApi';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface AuthState {
  student: Student | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  student: null,
  loading: true,

  checkAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.STUDENT_TOKEN);
    if (!token) {
      set({ loading: false, student: null });
      return;
    }
    try {
      const res = await authApi.getMe();
      set({ student: res.student, loading: false });
    } catch {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_TOKEN);
      set({ student: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem(STORAGE_KEYS.STUDENT_TOKEN, res.token);
    set({ student: res.student });
  },

  register: async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    localStorage.setItem(STORAGE_KEYS.STUDENT_TOKEN, res.token);
    set({ student: res.student });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENT_TOKEN);
    set({ student: null });
  },

  updateProfile: async (data) => {
    await authApi.updateProfile(data);
    const fresh = await authApi.getMe();
    set({ student: fresh.student });
  },
}));
