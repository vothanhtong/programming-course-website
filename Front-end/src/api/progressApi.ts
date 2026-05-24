import axiosClient from './axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';

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
  getMyEnrolledCourses: (): Promise<{ courses: any[] }> =>
    axiosClient.get(API_ROUTES.PROGRESS.MY_COURSES),

  getCourseProgress: (courseId: string): Promise<{ progress: CourseProgress }> =>
    axiosClient.get(`${API_ROUTES.PROGRESS.COURSE_BASE}/${courseId}`),

  updateLessonProgress: (
    courseId: string,
    lessonId: string,
    data: { watchedSeconds?: number; completed?: boolean }
  ): Promise<{ message: string; progress: any }> =>
    axiosClient.put(`${API_ROUTES.PROGRESS.COURSE_BASE}/${courseId}/lesson/${lessonId}`, data),

  getLearningStats: (): Promise<{ stats: LearningStats }> =>
    axiosClient.get(API_ROUTES.PROGRESS.STATS),

  adminGetStudentProgress: (
    courseId: string,
    page?: number,
    perPage?: number
  ): Promise<{ progressRecords: any[]; total: number; page: number; perPage: number }> =>
    axiosClient.get(`${API_ROUTES.PROGRESS.ADMIN_COURSE}/${courseId}`, { params: { page, perPage } }),
};

export default progressApi;
export type { CourseProgress, LearningStats, LessonProgress };
