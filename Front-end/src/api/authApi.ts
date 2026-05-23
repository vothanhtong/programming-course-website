import axiosClient from './axiosClient';

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
    axiosClient.post('/apis/auth/register', data),

  login: (data: { email: string; password: string }): Promise<AuthResponse> =>
    axiosClient.post('/apis/auth/login', data),

  getMe: (): Promise<{ student: Student }> =>
    axiosClient.get('/apis/auth/me'),

  updateProfile: (data: { fullName?: string; phone?: string; bio?: string; avatar?: string }): Promise<{ message: string; student: Student }> =>
    axiosClient.put('/apis/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    axiosClient.put('/apis/auth/change-password', data),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    axiosClient.post('/apis/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }): Promise<{ message: string }> =>
    axiosClient.post('/apis/auth/reset-password', data),

  // Lấy lịch sử chat — email lấy từ token phía server, không cần truyền
  getMyMessages: (): Promise<{ messages: any[]; hasMore: boolean; nextCursor: string | null; total: number }> =>
    axiosClient.get('/apis/messages/by-email'),
};

export default authApi;
