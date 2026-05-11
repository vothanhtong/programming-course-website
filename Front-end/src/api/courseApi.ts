import axiosClient from './axiosClient';
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
    axiosClient.get('/apis/courses', { params }),

  getFeatured: (): Promise<{ courses: Course[] }> =>
    axiosClient.get('/apis/courses/featured'),

  getCourseDetail: (slug: string): Promise<{ course: Course; lessons: any[]; reviews: any[] }> =>
    axiosClient.get(`/apis/courses/${slug}`),

  getCategories: (): Promise<{ categories: any[] }> =>
    axiosClient.get('/apis/categories'),

  enroll: (data: EnrollFormData): Promise<{ message: string; enrollmentId: string }> =>
    axiosClient.post('/apis/courses/enroll', data),

  postReview: (data: { courseId: string; studentName: string; rating: number; comment?: string }) =>
    axiosClient.post('/apis/courses/review', data),
};

export default courseApi;
