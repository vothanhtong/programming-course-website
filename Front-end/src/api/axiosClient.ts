import axios from 'axios';
import { API_ROUTES } from '../constants/apiRoutes';

// Dùng relative URL để webpack proxy tự forward /apis → localhost:5001
// Tránh CORS và network error khi gọi trực tiếp cross-origin
const BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.API_URL as string) || ''
  : ''; // dev: dùng webpack proxy

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Attach student token on every request
axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Khi gửi FormData (upload file), xóa Content-Type để browser
  // tự đặt multipart/form-data với boundary đúng — KHÔNG được set tay
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (!error.response) {
      // Network error — backend chưa chạy hoặc mất kết nối
      return Promise.reject({ message: 'Không thể kết nối đến server. Vui lòng thử lại.' });
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && originalRequest.url !== API_ROUTES.AUTH.REFRESH) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axiosClient.post(API_ROUTES.AUTH.REFRESH) as any;
          setAccessToken(res.token);
          originalRequest.headers.Authorization = `Bearer ${res.token}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          setAccessToken(null);
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            window.dispatchEvent(
              new CustomEvent('auth:unauthorized', {
                detail: { redirectTo: `/login?redirect=${encodeURIComponent(currentPath)}` },
              })
            );
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // BUG-13 FIX: Thay window.location.href (hard reload) bằng CustomEvent
    // App.tsx lắng nghe event này và dùng React Router navigate() để redirect
    // → Giữ nguyên SPA experience, không mất React state
    if (error.response.status === 401 && originalRequest.url === API_ROUTES.AUTH.REFRESH) {
      setAccessToken(null);

      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: { redirectTo: `/login?redirect=${encodeURIComponent(currentPath)}` },
          })
        );
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
