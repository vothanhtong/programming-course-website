import axios from 'axios';
import { STORAGE_KEYS } from '../../constants/storageKeys';

// Dùng relative URL khi ở dev để Webpack proxy tự forward /apis → localhost:5001
// Khi build production (Vercel), sẽ dùng API_URL
const BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.API_URL || '') 
  : '';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    // Network error hoặc timeout
    if (!error.response) {
      return Promise.reject({ message: 'Không thể kết nối đến server. Vui lòng thử lại.' });
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Tránh redirect loop khi đang ở trang login
      if (window.location.pathname !== '/admin/login') {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_INFO);
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
