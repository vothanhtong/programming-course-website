import { Request, Response, NextFunction } from 'express';
import { getStudentId } from '../types';
import {
  EMAIL_REGEX, isValidId, getParam, sanitizeStr,
  VALID_PAYMENT_STATUSES,
} from '../utils/validators';
import { courseService } from '../services/course.service';
import { categoryService } from '../services/category.service';
import { enrollmentService } from '../services/enrollment.service';
import { reviewService } from '../services/review.service';
import { lessonService } from '../services/lesson.service';
import { statsService } from '../services/stats.service';

const COURSE_ALLOWED_FIELDS = [
  'title', 'shortDescription', 'description', 'thumbnail', 'previewVideo',
  'price', 'salePrice', 'category', 'level', 'language', 'requirements',
  'outcomes', 'tags', 'isPublished', 'isFeatured', 'isFree',
  'instructor',
] as const;

const LESSON_ALLOWED_FIELDS = [
  'courseId', 'title', 'description', 'videoUrl', 'duration',
  'order', 'isFree', 'isPublished',
] as const;

const pickFields = <T extends Record<string, unknown>>(
  obj: T,
  fields: readonly string[]
): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of fields) {
    if (key in obj) (result as any)[key] = obj[key];
  }
  return result;
};

// ── PUBLIC ────────────────────────────────────────────────

export const getCourseList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await courseService.getCourseList(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const getCourseDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = getParam(req.params.slug);
    const result = await courseService.getCourseDetail(slug);
    res.json(result);
  } catch (err) { next(err); }
};

export const getFeaturedCourses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await courseService.getFeaturedCourses();
    res.json(result);
  } catch (err) { next(err); }
};

export const getCategoryList = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await categoryService.getCategoryList();
    res.json(result);
  } catch (err) { next(err); }
};

export const postEnroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, studentName, studentEmail, studentPhone, paymentMethod, note } = req.body;
    if (!courseId || !studentName?.trim() || !studentEmail?.trim()) {
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc' }); return;
    }
    if (!isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    if (!EMAIL_REGEX.test(studentEmail)) { res.status(400).json({ message: 'Email không hợp lệ' }); return; }

    const studentId = getStudentId(req) as string | undefined;
    const enrollment = await enrollmentService.postEnroll(req.body, studentId);
    
    res.status(201).json({ message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.', enrollmentId: enrollment?._id });
  } catch (err) { next(err); }
};

export const postReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, studentName, rating, comment } = req.body;
    if (!courseId || !studentName?.trim() || !rating) {
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc' }); return;
    }
    if (!isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    const name = sanitizeStr(studentName, 100);
    if (name.length < 2) { res.status(400).json({ message: 'Tên phải ít nhất 2 ký tự' }); return; }
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ message: 'Rating phải từ 1 đến 5' }); return;
    }
    const commentText = sanitizeStr(comment || '', 1000);
    
    await reviewService.postReview({ courseId, studentName: name, ratingNum, commentText });
    res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá! Đánh giá sẽ hiển thị sau khi duyệt.' });
  } catch (err) { next(err); }
};

// ── ADMIN ─────────────────────────────────────────────────

export const adminGetCourseList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await courseService.adminGetCourseList(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminAddCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = pickFields(req.body, COURSE_ALLOWED_FIELDS) as Record<string, unknown>;
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      res.status(400).json({ message: 'Thiếu title' }); return;
    }
    if (!data.category) { res.status(400).json({ message: 'Thiếu category' }); return; }
    if (data.price === undefined) { res.status(400).json({ message: 'Thiếu price' }); return; }
    if (!isValidId(data.category as string)) { res.status(400).json({ message: 'Category ID không hợp lệ' }); return; }
    if ((data.price as number) < 0 || (data.salePrice != null && (data.salePrice as number) < 0)) {
      res.status(400).json({ message: 'Giá không được âm' }); return;
    }

    const course = await courseService.adminAddCourse(data);
    res.status(201).json({ message: 'Thêm khóa học thành công', course });
  } catch (err: any) {
    if (err.code === 11000) { res.status(400).json({ message: 'Slug đã tồn tại' }); return; }
    next(err);
  }
};

export const adminUpdateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const data = pickFields(req.body, COURSE_ALLOWED_FIELDS);
    
    const course = await courseService.adminUpdateCourse(id, data);
    res.json({ message: 'Cập nhật thành công', course });
  } catch (err) { next(err); }
};

export const adminDeleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    await courseService.adminDeleteCourse(id);
    res.json({ message: 'Xóa khóa học thành công' });
  } catch (err) { next(err); }
};

export const adminGetEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await enrollmentService.adminGetEnrollments(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminDeleteEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    await enrollmentService.adminDeleteEnrollment(id);
    res.json({ message: 'Đã xóa đăng ký' });
  } catch (err) { next(err); }
};

export const adminUpdateEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const { paymentStatus } = req.body;
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      res.status(400).json({ message: 'paymentStatus không hợp lệ' }); return;
    }

    const enrollment = await enrollmentService.adminUpdateEnrollment(id, paymentStatus);
    res.json({ message: 'Cập nhật thành công', enrollment });
  } catch (err) { next(err); }
};

export const adminGetReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await reviewService.adminGetReviews(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminApproveReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    
    await reviewService.adminApproveReview(id);
    res.json({ message: 'Đã duyệt đánh giá' });
  } catch (err) { next(err); }
};

export const adminDeleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    
    await reviewService.adminDeleteReview(id);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) { next(err); }
};

export const adminGetCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await categoryService.adminGetCategories();
    res.json(result);
  } catch (err) { next(err); }
};

export const adminAddCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    if (!name?.trim()) { res.status(400).json({ message: 'Tên danh mục là bắt buộc' }); return; }
    
    const category = await categoryService.adminAddCategory({ name: name.trim(), description: description?.trim(), icon: icon?.trim() });
    res.status(201).json({ message: 'Thêm danh mục thành công', category });
  } catch (err: any) {
    if (err.code === 11000) { res.status(400).json({ message: 'Danh mục đã tồn tại' }); return; }
    next(err);
  }
};

export const adminDeleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    await categoryService.adminDeleteCategory(id);
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) { next(err); }
};

export const adminGetStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await statsService.adminGetStats();
    res.json(stats);
  } catch (err) { next(err); }
};

export const adminGetLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.query as { courseId?: string };
    if (!courseId || !isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    
    const result = await lessonService.adminGetLessons(courseId);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminAddLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = pickFields(req.body, LESSON_ALLOWED_FIELDS) as Record<string, unknown>;
    if (!data.courseId || !data.title || data.order === undefined) {
      res.status(400).json({ message: 'Thiếu courseId, title hoặc order' }); return;
    }
    if (!isValidId(data.courseId as string)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    
    const lesson = await lessonService.adminAddLesson(data);
    res.status(201).json({ message: 'Thêm bài học thành công', lesson });
  } catch (err) { next(err); }
};

export const adminUpdateLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const data = pickFields(req.body, LESSON_ALLOWED_FIELDS);
    delete (data as any).courseId; 
    
    const lesson = await lessonService.adminUpdateLesson(id, data);
    res.json({ message: 'Cập nhật thành công', lesson });
  } catch (err) { next(err); }
};

export const adminDeleteLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    
    await lessonService.adminDeleteLesson(id);
    res.json({ message: 'Đã xóa bài học' });
  } catch (err) { next(err); }
};

export const adminGetEnrollmentsByMonth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await enrollmentService.adminGetEnrollmentsByMonth();
    res.json({ data });
  } catch (err) { next(err); }
};