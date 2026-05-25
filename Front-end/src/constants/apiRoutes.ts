export const API_ROUTES = {
  AUTH: {
    REGISTER: '/apis/auth/register',
    LOGIN: '/apis/auth/login',
    LOGOUT: '/apis/auth/logout',
    REFRESH: '/apis/auth/refresh',
    ME: '/apis/auth/me',
    PROFILE: '/apis/auth/profile',
    CHANGE_PASSWORD: '/apis/auth/change-password',
    FORGOT_PASSWORD: '/apis/auth/forgot-password',
    RESET_PASSWORD: '/apis/auth/reset-password',
  },
  COURSES: {
    BASE: '/apis/courses',
    FEATURED: '/apis/courses/featured',
    ENROLL: '/apis/courses/enroll',
    REVIEW: '/apis/courses/review',
  },
  CATEGORIES: {
    BASE: '/apis/categories',
  },
  MESSAGES: {
    BASE: '/apis/messages',
    BY_EMAIL: '/apis/messages/by-email',
  },
  PROGRESS: {
    MY_COURSES: '/apis/progress/my-courses',
    STATS: '/apis/progress/stats',
    COURSE_BASE: '/apis/progress/course', // + /:courseId
    ADMIN_COURSE: '/apis/progress/admin/course', // + /:courseId
  },
  QUIZZES: {
    BASE: '/apis/quizzes', // + /:quizId
    COURSE: '/apis/quizzes/course', // + /:courseId
    HISTORY: '/apis/quizzes/history',
    SUBMIT: '/apis/quizzes', // + /:quizId/submit
  },
  UPLOAD: {
    IMAGE: '/apis/upload/image',
    STUDENT_AVATAR: '/apis/upload/student-avatar',
    ADMIN_AVATAR: '/apis/upload/admin-avatar',
  }
};

export const ADMIN_API_ROUTES = {
  BASE: '/apis/admin',
  LOGIN: '/apis/admin/login',
  LOGOUT: '/apis/admin/logout',
  REFRESH: '/apis/admin/refresh',
  PROFILE: '/apis/admin/profile',
  CHANGE_PASSWORD: '/apis/admin/change-password',
  STATS: '/apis/admin/stats',
  ENROLLMENTS_BY_MONTH: '/apis/admin/stats/enrollments-by-month',
  COURSES: '/apis/admin/courses',
  CATEGORIES: '/apis/admin/categories',
  LESSONS: '/apis/admin/lessons',
  ENROLLMENTS: '/apis/admin/enrollments',
  REVIEWS: '/apis/admin/reviews',
  STUDENTS: '/apis/admin/students',
  MESSAGES: '/apis/admin/messages',
  QUIZZES: '/apis/quizzes/admin',
};
