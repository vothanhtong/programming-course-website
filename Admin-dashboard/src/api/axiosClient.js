import axios from 'axios';

// Dùng relative URL để Vite proxy tự forward /apis → localhost:5001
// Tránh CORS khi admin chạy ở port khác (3001, 3002...)
const axiosClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
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
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
