import axiosClient from './axiosClient';

const BASE = '/apis/admin';

const adminApi = {
  // ── Auth ──────────────────────────────────────────────
  login:  (data) => axiosClient.post(`${BASE}/login`, data),
  logout: ()     => axiosClient.post(`${BASE}/logout`),

  // ── Admin profile ──────────────────────────────────────
  getProfile:      ()     => axiosClient.get(`${BASE}/profile`),
  updateProfile:   (data) => axiosClient.put(`${BASE}/profile`, data),
  changePassword:  (data) => axiosClient.put(`${BASE}/change-password`, data),

  // ── Stats ──────────────────────────────────────────────
  getStats:               () => axiosClient.get(`${BASE}/stats`),
  getEnrollmentsByMonth:  () => axiosClient.get(`${BASE}/stats/enrollments-by-month`),

  // ── Courses ────────────────────────────────────────────
  getCourses:    (params)     => axiosClient.get(`${BASE}/courses`, { params }),
  addCourse:     (data)       => axiosClient.post(`${BASE}/courses`, data),
  updateCourse:  (id, data)   => axiosClient.put(`${BASE}/courses/${id}`, data),
  deleteCourse:  (id)         => axiosClient.delete(`${BASE}/courses/${id}`),

  // ── Lessons ────────────────────────────────────────────
  getLessons:    (courseId)   => axiosClient.get(`${BASE}/lessons`, { params: { courseId } }),
  addLesson:     (data)       => axiosClient.post(`${BASE}/lessons`, data),
  updateLesson:  (id, data)   => axiosClient.put(`${BASE}/lessons/${id}`, data),
  deleteLesson:  (id)         => axiosClient.delete(`${BASE}/lessons/${id}`),

  // ── Categories ─────────────────────────────────────────
  getCategories:  ()     => axiosClient.get(`${BASE}/categories`),
  addCategory:    (data) => axiosClient.post(`${BASE}/categories`, data),
  deleteCategory: (id)   => axiosClient.delete(`${BASE}/categories/${id}`),

  // ── Enrollments ────────────────────────────────────────
  getEnrollments:   (params)     => axiosClient.get(`${BASE}/enrollments`, { params }),
  updateEnrollment: (id, data)   => axiosClient.put(`${BASE}/enrollments/${id}`, data),
  deleteEnrollment: (id)         => axiosClient.delete(`${BASE}/enrollments/${id}`),

  // ── Reviews ────────────────────────────────────────────
  getReviews:    (params) => axiosClient.get(`${BASE}/reviews`, { params }),
  approveReview: (id)     => axiosClient.put(`${BASE}/reviews/${id}/approve`),
  deleteReview:  (id)     => axiosClient.delete(`${BASE}/reviews/${id}`),

  // ── Student management ─────────────────────────────────
  getStudents:          (params)     => axiosClient.get(`${BASE}/students`, { params }),
  getStudentDetail:     (id)         => axiosClient.get(`${BASE}/students/${id}`),
  createStudent:        (data)       => axiosClient.post(`${BASE}/students`, data),
  updateStudent:        (id, data)   => axiosClient.put(`${BASE}/students/${id}`, data),
  deleteStudent:        (id)         => axiosClient.delete(`${BASE}/students/${id}`),
  resetStudentPassword: (id, data)   => axiosClient.put(`${BASE}/students/${id}/reset-password`, data),
  grantCourses:         (id, data)   => axiosClient.post(`${BASE}/students/${id}/grant-courses`, data),
  revokeStudentCourse:  (id, courseId) => axiosClient.delete(`${BASE}/students/${id}/courses/${courseId}`),

  // ── Upload ─────────────────────────────────────────────
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post('/apis/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (filename) => axiosClient.delete(`/apis/upload/image/${filename}`),

  // ── Messages ───────────────────────────────────────────
  getMessages:     (params) => axiosClient.get(`${BASE}/messages`, { params }),
  getUnreadCount:  ()       => axiosClient.get(`${BASE}/messages/unread-count`),
  markMessageRead: (id)     => axiosClient.put(`${BASE}/messages/${id}/read`),
  deleteMessage:   (id)     => axiosClient.delete(`${BASE}/messages/${id}`),
};

export default adminApi;
