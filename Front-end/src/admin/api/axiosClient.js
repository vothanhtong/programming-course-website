import axios from 'axios';
import { ADMIN_API_ROUTES } from '../../constants/apiRoutes';

// Dùng relative URL khi ở dev để Webpack proxy tự forward /apis → localhost:5001
// Khi build production (Vercel), sẽ dùng API_URL
const BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.API_URL || '') 
  : '';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

let adminAccessToken = null;

export const setAdminAccessToken = (token) => {
  adminAccessToken = token;
};

export const getAdminAccessToken = () => adminAccessToken;

axiosClient.interceptors.request.use((config) => {
  if (adminAccessToken) {
    config.headers.Authorization = `Bearer ${adminAccessToken}`;
  }

  // Khi gửi FormData (upload file), xóa Content-Type để browser
  // tự đặt multipart/form-data với boundary đúng — KHÔNG được set tay
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  // Prevent GET request caching by browser
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
  }
  
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Network error hoặc timeout
    if (!error.response) {
      return Promise.reject({ message: 'Không thể kết nối đến server. Vui lòng thử lại.' });
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && originalRequest.url !== ADMIN_API_ROUTES.REFRESH) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axiosClient.post(ADMIN_API_ROUTES.REFRESH);
          setAdminAccessToken(res.token);
          originalRequest.headers.Authorization = `Bearer ${res.token}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          setAdminAccessToken(null);
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response.status === 401 && originalRequest.url === ADMIN_API_ROUTES.REFRESH) {
      setAdminAccessToken(null);
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    if (error.response?.status === 403) {
      // Access denied
      if (window.location.pathname !== '/admin/login') {
        setAdminAccessToken(null);
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
