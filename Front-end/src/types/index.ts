export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

export interface Instructor {
  name: string;
  avatar?: string;
  bio?: string;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  previewVideo?: string;
  price: number;
  salePrice?: number | null;
  category: Category | string;
  instructor: Instructor;
  level: CourseLevel;
  language?: string;
  requirements?: string[];
  outcomes?: string[];
  tags?: string[];
  totalLessons: number;
  totalDuration?: number;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  isFree: boolean;
  createdAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export interface Review {
  _id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface EnrollFormData {
  courseId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  paymentMethod?: string;
  note?: string;
}

export interface ReviewFormData {
  courseId: string;
  studentName: string;
  rating: number;
  comment?: string;
}

export interface CourseDetailResponse {
  course: Course;
  lessons: Lesson[];
  reviews: Review[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  perPage: number;
}
