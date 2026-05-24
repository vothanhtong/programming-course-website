import { create } from 'zustand';
import adminAuthApi from '../admin/api/adminApi';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface AdminState {
  admin: any | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  loading: true,

  checkAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!token) {
      set({ loading: false, admin: null });
      return;
    }
    try {
      const res = await adminAuthApi.getProfile() as any;
      set({ admin: res.admin, loading: false });
    } catch {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      set({ admin: null, loading: false });
    }
  },

  login: async (userName, password) => {
    const res = await adminAuthApi.login({ userName, password }) as any;
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, res.token);
    set({ admin: res.admin });
  },

  logout: async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {}
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    set({ admin: null });
  },

  updateProfile: async (data) => {
    await adminAuthApi.updateProfile(data);
    const res = await adminAuthApi.getProfile() as any;
    set({ admin: res.admin });
  },
}));
