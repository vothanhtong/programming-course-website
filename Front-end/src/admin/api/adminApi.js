import axiosClient from './axiosClient';
import { ADMIN_API_ROUTES, API_ROUTES } from '../../constants/apiRoutes';

const adminApi = {
  // ── Auth ──────────────────────────────────────────────
  login:  (data) => axiosClient.post(ADMIN_API_ROUTES.LOGIN, data),
  logout: ()     => axiosClient.post(ADMIN_API_ROUTES.LOGOUT),

  // ── Admin profile ──────────────────────────────────────
  getProfile:      ()     => axiosClient.get(ADMIN_API_ROUTES.PROFILE),
  updateProfile:   (data) => axiosClient.put(ADMIN_API_ROUTES.PROFILE, data),
  changePassword:  (data) => axiosClient.put(ADMIN_API_ROUTES.CHANGE_PASSWORD, data),

  // ── Stats ──────────────────────────────────────────────
  getStats:               () => axiosClient.get(ADMIN_API_ROUTES.STATS),
  getEnrollmentsByMonth:  () => axiosClient.get(ADMIN_API_ROUTES.ENROLLMENTS_BY_MONTH),

  // ── Courses ────────────────────────────────────────────
  getCourses:    (params)     => axiosClient.get(ADMIN_API_ROUTES.COURSES, { params }),
  addCourse:     (data)       => axiosClient.post(ADMIN_API_ROUTES.COURSES, data),
  updateCourse:  (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.COURSES}/${id}`, data),
  deleteCourse:  (id)         => axiosClient.delete(`${ADMIN_API_ROUTES.COURSES}/${id}`),

  // ── Lessons ────────────────────────────────────────────
  getLessons:    (courseId)   => axiosClient.get(ADMIN_API_ROUTES.LESSONS, { params: { courseId } }),
  addLesson:     (data)       => axiosClient.post(ADMIN_API_ROUTES.LESSONS, data),
  updateLesson:  (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.LESSONS}/${id}`, data),
  deleteLesson:  (id)         => axiosClient.delete(`${ADMIN_API_ROUTES.LESSONS}/${id}`),

  // ── Categories ─────────────────────────────────────────
  getCategories:  ()     => axiosClient.get(ADMIN_API_ROUTES.CATEGORIES),
  addCategory:    (data) => axiosClient.post(ADMIN_API_ROUTES.CATEGORIES, data),
  deleteCategory: (id)   => axiosClient.delete(`${ADMIN_API_ROUTES.CATEGORIES}/${id}`),

  // ── Enrollments ────────────────────────────────────────
  getEnrollments:   (params)     => axiosClient.get(ADMIN_API_ROUTES.ENROLLMENTS, { params }),
  updateEnrollment: (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.ENROLLMENTS}/${id}`, data),
  deleteEnrollment: (id)         => axiosClient.delete(`${ADMIN_API_ROUTES.ENROLLMENTS}/${id}`),

  // ── Reviews ────────────────────────────────────────────
  getReviews:    (params) => axiosClient.get(ADMIN_API_ROUTES.REVIEWS, { params }),
  approveReview: (id)     => axiosClient.put(`${ADMIN_API_ROUTES.REVIEWS}/${id}/approve`),
  deleteReview:  (id)     => axiosClient.delete(`${ADMIN_API_ROUTES.REVIEWS}/${id}`),

  // ── Quizzes ────────────────────────────────────────────
  getQuizzes:    (params)     => axiosClient.get(ADMIN_API_ROUTES.QUIZZES, { params }),
  addQuiz:       (data)       => axiosClient.post(ADMIN_API_ROUTES.QUIZZES, data),
  updateQuiz:    (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.QUIZZES}/${id}`, data),
  deleteQuiz:    (id)         => axiosClient.delete(`${ADMIN_API_ROUTES.QUIZZES}/${id}`),

  // ── Student management ─────────────────────────────────
  getStudents:          (params)     => axiosClient.get(ADMIN_API_ROUTES.STUDENTS, { params }),
  getStudentDetail:     (id)         => axiosClient.get(`${ADMIN_API_ROUTES.STUDENTS}/${id}`),
  createStudent:        (data)       => axiosClient.post(ADMIN_API_ROUTES.STUDENTS, data),
  updateStudent:        (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.STUDENTS}/${id}`, data),
  deleteStudent:        (id)         => axiosClient.delete(`${ADMIN_API_ROUTES.STUDENTS}/${id}`),
  resetStudentPassword: (id, data)   => axiosClient.put(`${ADMIN_API_ROUTES.STUDENTS}/${id}/reset-password`, data),
  grantCourses:         (id, data)   => axiosClient.post(`${ADMIN_API_ROUTES.STUDENTS}/${id}/grant-courses`, data),
  revokeStudentCourse:  (id, courseId) => axiosClient.delete(`${ADMIN_API_ROUTES.STUDENTS}/${id}/courses/${courseId}`),

  // ── Upload ─────────────────────────────────────────────
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post(API_ROUTES.UPLOAD.IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (filename) => axiosClient.delete(`${API_ROUTES.UPLOAD.IMAGE}/${filename}`),

  // ── Messages ───────────────────────────────────────────
  getMessages:     (params) => axiosClient.get(ADMIN_API_ROUTES.MESSAGES, { params }),
  getUnreadCount:  ()       => axiosClient.get(`${ADMIN_API_ROUTES.MESSAGES}/unread-count`),
  markMessageRead: (id)     => axiosClient.put(`${ADMIN_API_ROUTES.MESSAGES}/${id}/read`),
  replyMessage:    (id, reply) => axiosClient.put(`${ADMIN_API_ROUTES.MESSAGES}/${id}/reply`, { reply }),
  deleteMessage:   (id)     => axiosClient.delete(`${ADMIN_API_ROUTES.MESSAGES}/${id}`),
};

export default adminApi;
