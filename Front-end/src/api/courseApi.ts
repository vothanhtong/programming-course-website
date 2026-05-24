import axiosClient from './axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';
import type { Course, CoursesResponse, EnrollFormData } from '../types';

interface CourseListParams {
  page?: number;
  perPage?: number;
  category?: string;
  level?: string;
  search?: string;
  featured?: boolean;
}

const courseApi = {
  getCourses: (params?: CourseListParams): Promise<CoursesResponse> =>
    axiosClient.get(API_ROUTES.COURSES.BASE, { params }),

  getFeatured: (): Promise<{ courses: Course[] }> =>
    axiosClient.get(API_ROUTES.COURSES.FEATURED),

  getCourseDetail: (slug: string): Promise<{ course: Course; lessons: any[]; reviews: any[] }> =>
    axiosClient.get(`${API_ROUTES.COURSES.BASE}/${slug}`),

  getCategories: (): Promise<{ categories: any[] }> =>
    axiosClient.get(API_ROUTES.CATEGORIES.BASE),

  enroll: (data: EnrollFormData): Promise<{ message: string; enrollmentId: string }> =>
    axiosClient.post(API_ROUTES.COURSES.ENROLL, data),

  postReview: (data: { courseId: string; studentName: string; rating: number; comment?: string }) =>
    axiosClient.post(API_ROUTES.COURSES.REVIEW, data),
};

export default courseApi;
