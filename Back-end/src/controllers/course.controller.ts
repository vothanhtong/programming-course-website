import { Request, Response } from 'express';
import CourseModel     from '../models/course.models/course.model';
import CategoryModel   from '../models/course.models/category.model';
import LessonModel     from '../models/course.models/lesson.model';
import ReviewModel     from '../models/course.models/review.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import MessageModel    from '../models/course.models/message.model';
import StudentModel    from '../models/student.model';
import logger from '../configs/logger';
import { getStudentId } from '../types';
import {
  EMAIL_REGEX, isValidId, getParam, sanitizeStr, escapeRegex,
  VALID_LEVELS, VALID_PAYMENT_STATUSES,
} from '../utils/validators';
import type { PaymentStatus } from '../utils/validators';

const makeSlug = (title: string): string =>
  title.toLowerCase()
    .replace(/đ/g, 'd')           // xử lý chữ đ trước khi normalize
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// Whitelist các field được phép update cho course (tránh mass assignment)
const COURSE_ALLOWED_FIELDS = [
  'title', 'shortDescription', 'description', 'thumbnail', 'previewVideo',
  'price', 'salePrice', 'category', 'level', 'language', 'requirements',
  'outcomes', 'tags', 'isPublished', 'isFeatured', 'isFree',
  'instructor',
] as const;

// Whitelist cho lesson
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

export const getCourseList = async (req: Request, res: Response): Promise<void> => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage as string) || 9));
    const { category, level, search, featured } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isPublished: true };
    if (category && isValidId(category)) filter.category = category;
    if (level && VALID_LEVELS.includes(level as any)) filter.level = level;
    if (featured === 'true') filter.isFeatured = true;
    if (search?.trim()) {
      const safe = escapeRegex(sanitizeStr(search, 100));
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { tags:  { $in: [new RegExp(safe, 'i')] } },
      ];
    }

    const [total, courses] = await Promise.all([
      CourseModel.countDocuments(filter),
      CourseModel.find(filter)
        .populate('category', 'name slug')
        .select('-requirements -outcomes -description')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    res.json({ courses, total, page, perPage });
  } catch (err) {
    logger.error('[getCourseList]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getCourseDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = getParam(req.params.slug);
    const course = await CourseModel.findOne({ slug, isPublished: true })
      .populate('category', 'name slug').lean();
    if (!course) { res.status(404).json({ message: 'Không tìm thấy khóa học' }); return; }

    const [lessons, reviews] = await Promise.all([
      LessonModel.find({ courseId: course._id, isPublished: true })
        .select('title duration order isFree').sort({ order: 1 }).lean(),
      ReviewModel.find({ courseId: course._id, isApproved: true })
        .select('studentName studentAvatar rating comment createdAt')
        .sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    res.json({ course, lessons, reviews });
  } catch (err) {
    logger.error('[getCourseDetail]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getFeaturedCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await CourseModel.find({ isPublished: true, isFeatured: true })
      .populate('category', 'name slug')
      .select('title slug thumbnail shortDescription price salePrice rating ratingCount enrollmentCount level instructor isFree')
      .limit(6).lean();
    res.json({ courses });
  } catch (err) {
    logger.error('[getFeaturedCourses]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getCategoryList = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ categories });
  } catch (err) {
    logger.error('[getCategoryList]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const postEnroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, studentName, studentEmail, studentPhone, paymentMethod, note } = req.body;
    if (!courseId || !studentName?.trim() || !studentEmail?.trim()) {
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc' }); return;
    }
    if (!isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    if (!EMAIL_REGEX.test(studentEmail)) { res.status(400).json({ message: 'Email không hợp lệ' }); return; }

    const course = await CourseModel.findById(courseId).select('isPublished isFree price salePrice').lean();
    if (!course?.isPublished) { res.status(404).json({ message: 'Khóa học không tồn tại' }); return; }

    // Nếu student đã đăng nhập → dùng email tài khoản để đảm bảo match chính xác
    const studentId = getStudentId(req) as string | undefined;
    let resolvedEmail = studentEmail.trim().toLowerCase();
    if (studentId && isValidId(studentId)) {
      const student = await StudentModel.findById(studentId).select('email').lean();
      if (student?.email) resolvedEmail = student.email;
    }

    // Kiểm tra duplicate enrollment
    const existing = await EnrollmentModel.findOne({
      courseId,
      studentEmail: resolvedEmail,
    }).lean();
    if (existing) {
      res.status(409).json({ message: 'Bạn đã đăng ký khóa học này rồi' }); return;
    }

    const amount = course.salePrice != null ? course.salePrice : course.price;
    const isFree = course.isFree;

    const enrollment = await EnrollmentModel.create({
      courseId,
      studentName:   studentName.trim(),
      studentEmail:  resolvedEmail,
      studentPhone:  studentPhone?.trim() || '',
      paymentMethod: paymentMethod || 'other',
      amount,
      note:          note?.trim() || '',
      paymentStatus: isFree ? 'paid' : 'pending',
    });

    if (isFree) {
      // Khóa học miễn phí → cấp ngay
      await CourseModel.updateOne({ _id: courseId }, { $inc: { enrollmentCount: 1 } });
      if (studentId && isValidId(studentId)) {
        await StudentModel.updateOne(
          { _id: studentId },
          { $addToSet: { enrolledCourses: courseId } }
        );
      } else {
        // Không đăng nhập → match bằng email
        await StudentModel.updateOne(
          { email: resolvedEmail },
          { $addToSet: { enrolledCourses: courseId } }
        );
      }
    } else {
      // Khóa học trả phí → thêm vào enrolledCourses ngay để user thấy "đang chờ xác nhận"
      // Admin confirm paid sẽ không cần update lại vì đã có rồi
      if (studentId && isValidId(studentId)) {
        await StudentModel.updateOne(
          { _id: studentId },
          { $addToSet: { enrolledCourses: courseId } }
        );
      } else {
        await StudentModel.updateOne(
          { email: resolvedEmail },
          { $addToSet: { enrolledCourses: courseId } }
        );
      }
    }

    res.status(201).json({ message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm.', enrollmentId: enrollment._id });
  } catch (err) {
    logger.error('[postEnroll]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const postReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, studentName, rating, comment } = req.body;
    if (!courseId || !studentName?.trim() || !rating) {
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc' }); return;
    }
    if (!isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    // Validate độ dài studentName để tránh spam
    const name = sanitizeStr(studentName, 100);
    if (name.length < 2) { res.status(400).json({ message: 'Tên phải ít nhất 2 ký tự' }); return; }
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ message: 'Rating phải từ 1 đến 5' }); return;
    }
    // Validate comment length
    const commentText = sanitizeStr(comment || '', 1000);
    await ReviewModel.create({ courseId, studentName: name, rating: ratingNum, comment: commentText });
    res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá! Đánh giá sẽ hiển thị sau khi duyệt.' });
  } catch (err) {
    logger.error('[postReview]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── ADMIN ─────────────────────────────────────────────────

export const adminGetCourseList = async (req: Request, res: Response): Promise<void> => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 10));
    const [total, courses] = await Promise.all([
      CourseModel.countDocuments(),
      CourseModel.find().populate('category', 'name').sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    res.json({ courses, total });
  } catch (err) { logger.error('[adminGetCourseList]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminAddCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Whitelist fields để tránh mass assignment
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
    if (!data.slug) data.slug = makeSlug(data.title as string) + '-' + Date.now();
    const course = await CourseModel.create(data);
    res.status(201).json({ message: 'Thêm khóa học thành công', course });
  } catch (err: any) {
    if (err.code === 11000) { res.status(400).json({ message: 'Slug đã tồn tại' }); return; }
    logger.error('[adminAddCourse]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminUpdateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    // Whitelist fields để tránh mass assignment
    const data = pickFields(req.body, COURSE_ALLOWED_FIELDS);
    const course = await CourseModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!course) { res.status(404).json({ message: 'Không tìm thấy khóa học' }); return; }
    res.json({ message: 'Cập nhật thành công', course });
  } catch (err) { logger.error('[adminUpdateCourse]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminDeleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    await Promise.all([
      CourseModel.findByIdAndDelete(id),
      LessonModel.deleteMany({ courseId: id }),
      ReviewModel.deleteMany({ courseId: id }),
    ]);
    res.json({ message: 'Xóa khóa học thành công' });
  } catch (err) { logger.error('[adminDeleteCourse]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 20));
    const { courseId, status } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (courseId && isValidId(courseId)) filter.courseId = courseId;
    if (status) filter.paymentStatus = status;
    const [total, enrollments] = await Promise.all([
      EnrollmentModel.countDocuments(filter),
      EnrollmentModel.find(filter).populate('courseId', 'title')
        .sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    res.json({ enrollments, total });
  } catch (err) { logger.error('[adminGetEnrollments]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminDeleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const enrollment = await EnrollmentModel.findByIdAndDelete(id);
    if (!enrollment) { res.status(404).json({ message: 'Không tìm thấy đăng ký' }); return; }

    // Nếu đã paid → giảm enrollmentCount và thu hồi khóa học
    if (enrollment.paymentStatus === 'paid') {
      await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: -1 } });
      await StudentModel.updateOne(
        { email: enrollment.studentEmail },
        { $pull: { enrolledCourses: enrollment.courseId } }
      );
    }

    res.json({ message: 'Đã xóa đăng ký' });
  } catch (err) { logger.error('[adminDeleteEnrollment]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminUpdateEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const { paymentStatus } = req.body as { paymentStatus: PaymentStatus };
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      res.status(400).json({ message: 'paymentStatus không hợp lệ' }); return;
    }
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment) { res.status(404).json({ message: 'Không tìm thấy' }); return; }

    const wasPaid = enrollment.paymentStatus === 'paid';
    const nowPaid = paymentStatus === 'paid';
    enrollment.paymentStatus = paymentStatus;
    await enrollment.save();

    // Khi chuyển sang paid → tăng enrollmentCount + cấp khóa học cho student
    if (!wasPaid && nowPaid) {
      await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: 1 } });
      // Tìm student theo email và cấp khóa học
      await StudentModel.updateOne(
        { email: enrollment.studentEmail },
        { $addToSet: { enrolledCourses: enrollment.courseId } }
      );
    }
    // Khi hủy paid → giảm enrollmentCount
    if (wasPaid && !nowPaid) {
      await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: -1 } });
      await StudentModel.updateOne(
        { email: enrollment.studentEmail },
        { $pull: { enrolledCourses: enrollment.courseId } }
      );
    }

    res.json({ message: 'Cập nhật thành công', enrollment });
  } catch (err) { logger.error('[adminUpdateEnrollment]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage as string) || 20));
    const { approved } = req.query as { approved?: string };
    const filter: Record<string, unknown> = {};
    if (approved !== undefined) filter.isApproved = approved === 'true';
    const [total, reviews] = await Promise.all([
      ReviewModel.countDocuments(filter),
      ReviewModel.find(filter)
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    res.json({ reviews, total, page, perPage });
  } catch (err) { logger.error('[adminGetReviews]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminApproveReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const review = await ReviewModel.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!review) { res.status(404).json({ message: 'Không tìm thấy' }); return; }

    // Atomic aggregation để tránh race condition
    const [agg] = await ReviewModel.aggregate([
      { $match: { courseId: review.courseId, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg) {
      await CourseModel.updateOne(
        { _id: review.courseId },
        { rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.count }
      );
    }
    res.json({ message: 'Đã duyệt đánh giá' });
  } catch (err) { logger.error('[adminApproveReview]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminDeleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const review = await ReviewModel.findByIdAndDelete(id);
    // Cập nhật lại rating của course sau khi xóa
    if (review) {
      const [agg] = await ReviewModel.aggregate([
        { $match: { courseId: review.courseId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await CourseModel.updateOne(
        { _id: review.courseId },
        agg
          ? { rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.count }
          : { rating: 0, ratingCount: 0 }
      );
    }
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) { logger.error('[adminDeleteReview]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    res.json({ categories });
  } catch (err) { logger.error('[adminGetCategories]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminAddCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body as { name: string; description?: string; icon?: string };
    if (!name?.trim()) { res.status(400).json({ message: 'Tên danh mục là bắt buộc' }); return; }
    const slug = makeSlug(name);
    const category = await CategoryModel.create({ name: name.trim(), slug, description: description?.trim() || '', icon: icon?.trim() || '' });
    res.status(201).json({ message: 'Thêm danh mục thành công', category });
  } catch (err: any) {
    if (err.code === 11000) { res.status(400).json({ message: 'Danh mục đã tồn tại' }); return; }
    logger.error('[adminAddCategory]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminDeleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    // Kiểm tra có course nào đang dùng category này không
    const courseCount = await CourseModel.countDocuments({ category: id });
    if (courseCount > 0) {
      res.status(400).json({
        message: `Không thể xóa: có ${courseCount} khóa học đang dùng danh mục này`,
      });
      return;
    }

    await CategoryModel.findByIdAndDelete(id);
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) { logger.error('[adminDeleteCategory]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalCourses, totalEnrollments, revenueAgg, pendingReviews, unreadMessages] = await Promise.all([
      CourseModel.countDocuments(),
      EnrollmentModel.countDocuments(),
      EnrollmentModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ReviewModel.countDocuments({ isApproved: false }),
      MessageModel.countDocuments({ isRead: false }),
    ]);
    res.json({ totalCourses, totalEnrollments, totalRevenue: revenueAgg[0]?.total || 0, pendingReviews, unreadMessages });
  } catch (err) { logger.error('[adminGetStats]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query as { courseId?: string };
    if (!courseId || !isValidId(courseId)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    const lessons = await LessonModel.find({ courseId }).sort({ order: 1 }).lean();
    res.json({ lessons });
  } catch (err) { logger.error('[adminGetLessons]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminAddLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = pickFields(req.body, LESSON_ALLOWED_FIELDS) as Record<string, unknown>;
    if (!data.courseId || !data.title || data.order === undefined) {
      res.status(400).json({ message: 'Thiếu courseId, title hoặc order' }); return;
    }
    if (!isValidId(data.courseId as string)) { res.status(400).json({ message: 'courseId không hợp lệ' }); return; }
    const lesson = await LessonModel.create(data);
    const count  = await LessonModel.countDocuments({ courseId: data.courseId });
    await CourseModel.updateOne({ _id: data.courseId }, { totalLessons: count });
    res.status(201).json({ message: 'Thêm bài học thành công', lesson });
  } catch (err) { logger.error('[adminAddLesson]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminUpdateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const data = pickFields(req.body, LESSON_ALLOWED_FIELDS);
    delete (data as any).courseId; // không cho đổi courseId
    const lesson = await LessonModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!lesson) { res.status(404).json({ message: 'Không tìm thấy bài học' }); return; }
    res.json({ message: 'Cập nhật thành công', lesson });
  } catch (err) { logger.error('[adminUpdateLesson]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminDeleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await LessonModel.findByIdAndDelete(getParam(req.params.id));
    if (lesson) {
      const count = await LessonModel.countDocuments({ courseId: lesson.courseId });
      await CourseModel.updateOne({ _id: lesson.courseId }, { totalLessons: count });
    }
    res.json({ message: 'Đã xóa bài học' });
  } catch (err) { logger.error('[adminDeleteLesson]', err); res.status(500).json({ message: 'Lỗi server' }); }
};

export const adminGetEnrollmentsByMonth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const data = await EnrollmentModel.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const result: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = data.find((x: any) => x._id.year === year && x._id.month === month);
      result.push({ month: `T${month}/${String(year).slice(2)}`, count: found?.count || 0 });
    }

    res.json({ data: result });
  } catch (err) {
    logger.error('[adminGetEnrollmentsByMonth]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
