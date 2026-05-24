import axiosClient from './axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  enrolledCourses?: any[];
}

export interface AuthResponse {
  message: string;
  token: string;
  student: Student;
}

const authApi = {
  register: (data: { fullName: string; email: string; password: string }): Promise<AuthResponse> =>
    axiosClient.post(API_ROUTES.AUTH.REGISTER, data),

  login: (data: { email: string; password: string }): Promise<AuthResponse> =>
    axiosClient.post(API_ROUTES.AUTH.LOGIN, data),

  getMe: (): Promise<{ student: Student }> =>
    axiosClient.get(API_ROUTES.AUTH.ME),

  updateProfile: (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }): Promise<{ message: string; student: Student }> =>
    axiosClient.put(API_ROUTES.AUTH.PROFILE, data),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    axiosClient.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    axiosClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (data: { token: string; newPassword: string }): Promise<{ message: string }> =>
    axiosClient.post(API_ROUTES.AUTH.RESET_PASSWORD, data),

  getMyMessages: (): Promise<{ messages: any[]; hasMore: boolean; nextCursor: string | null; total: number }> =>
    axiosClient.get(API_ROUTES.MESSAGES.BY_EMAIL),
};

export default authApi;
