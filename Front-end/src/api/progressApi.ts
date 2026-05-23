import axiosClient from './axiosClient';

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  totalSeconds: number;
  completedAt?: string;
}

interface CourseProgress {
  _id: string;
  studentId: string;
  courseId: string;
  lessonsProgress: LessonProgress[];
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  enrolledAt: string;
  completedAt?: string;
}

interface LearningStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalLessons: number;
  totalLessonsCompleted: number;
  averageProgress: number;
  inProgress: number;
  notStarted: number;
}

const progressApi = {
  // Get my enrolled courses
  getMyEnrolledCourses: (): Promise<{ courses: any[] }> =>
    axiosClient.get('/apis/progress/my-courses'),

  // Get course progress
  getCourseProgress: (courseId: string): Promise<{ progress: CourseProgress }> =>
    axiosClient.get(`/apis/progress/course/${courseId}`),

  // Update lesson progress
  updateLessonProgress: (
    courseId: string,
    lessonId: string,
    data: { watchedSeconds?: number; completed?: boolean }
  ): Promise<{ message: string; progress: any }> =>
    axiosClient.put(`/apis/progress/course/${courseId}/lesson/${lessonId}`, data),

  // Get learning stats
  getLearningStats: (): Promise<{ stats: LearningStats }> =>
    axiosClient.get('/apis/progress/stats'),

  // Admin: Get student progress in course
  adminGetStudentProgress: (
    courseId: string,
    page?: number,
    perPage?: number
  ): Promise<{ progressRecords: any[]; total: number; page: number; perPage: number }> =>
    axiosClient.get(`/apis/progress/admin/course/${courseId}`, { params: { page, perPage } }),
};

export default progressApi;
export type { CourseProgress, LearningStats, LessonProgress };
