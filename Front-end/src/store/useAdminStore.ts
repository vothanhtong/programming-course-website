import { create } from 'zustand';
import adminAuthApi from '../admin/api/adminApi';
import { setAdminAccessToken } from '../admin/api/axiosClient';

interface AdminState {
  admin: any | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  loading: true,

  checkAuth: async () => {
    try {
      const res = await adminAuthApi.getProfile() as any;
      set({ admin: res.admin, loading: false });
    } catch {
      setAdminAccessToken(null);
      set({ admin: null, loading: false });
    }
  },

  login: async (userName, password) => {
    const res = await adminAuthApi.login({ userName, password }) as any;
    setAdminAccessToken(res.token);
    set({ admin: res.admin });
  },

  logout: async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {}
    setAdminAccessToken(null);
    set({ admin: null });
  },

  updateProfile: async (data) => {
    await adminAuthApi.updateProfile(data);
    const res = await adminAuthApi.getProfile() as any;
    set({ admin: res.admin });
  },
}));
