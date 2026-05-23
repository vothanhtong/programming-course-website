import axios from 'axios';

// Dùng relative URL để webpack proxy tự forward /apis → localhost:5001
// Tránh CORS và network error khi gọi trực tiếp cross-origin
const BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.API_URL as string) || ''
  : ''; // dev: dùng webpack proxy

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach student token on every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('student_token');
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
    if (!error.response) {
      // Network error — backend chưa chạy hoặc mất kết nối
      return Promise.reject({ message: 'Không thể kết nối đến server. Vui lòng thử lại.' });
    }

    // ⚡ REFACTOR: Centralized 401 handling
    // Automatically redirect to login on unauthorized access
    if (error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('student_token');
      
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
