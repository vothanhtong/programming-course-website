import mongoose from 'mongoose';
import CourseModel from '../models/course.models/course.model';
import LessonModel from '../models/course.models/lesson.model';
import ReviewModel from '../models/course.models/review.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import ProgressModel from '../models/course.models/progress.model';
import StudentModel from '../models/student.model';
import { escapeRegex } from '../utils/validators';
import { invalidateAdminStatsCache } from '../utils/cache';

const makeSlug = (title: string): string =>
  title.toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export const courseService = {
  async getCourseList(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(query.perPage as string) || 9));
    const filter: Record<string, unknown> = { isPublished: true };

    if (query.category) filter.category = query.category;
    if (query.level) filter.level = query.level;
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.search?.trim()) {
      const safe = escapeRegex(query.search);
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { tags: { $in: [new RegExp(safe, 'i')] } },
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

    return { courses, total, page, perPage };
  },

  async getCourseDetail(slug: string) {
    const course = await CourseModel.findOne({ slug, isPublished: true })
      .populate('category', 'name slug').lean();
    
    if (!course) {
      const err: any = new Error('Không tìm thấy khóa học');
      err.status = 404;
      throw err;
    }

    const [lessons, reviews] = await Promise.all([
      LessonModel.find({ courseId: course._id, isPublished: true })
        .select('title duration order isFree').sort({ order: 1 }).lean(),
      ReviewModel.find({ courseId: course._id, isApproved: true })
        .select('studentName studentAvatar rating comment createdAt')
        .sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return { course, lessons, reviews };
  },

  async getFeaturedCourses() {
    const courses = await CourseModel.find({ isPublished: true, isFeatured: true })
      .populate('category', 'name slug')
      .select('title slug thumbnail shortDescription price salePrice rating ratingCount enrollmentCount level instructor isFree')
      .limit(6).lean();
    return { courses };
  },

  async adminGetCourseList(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(query.perPage as string) || 10));
    
    const [total, courses] = await Promise.all([
      CourseModel.countDocuments(),
      CourseModel.find().populate('category', 'name').sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    return { courses, total };
  },

  async adminAddCourse(data: any) {
    if (!data.slug) data.slug = makeSlug(data.title as string) + '-' + Date.now();
    const course = await CourseModel.create(data);
    invalidateAdminStatsCache();
    return course;
  },

  async adminUpdateCourse(id: string, data: any) {
    const course = await CourseModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!course) {
      const err: any = new Error('Không tìm thấy khóa học');
      err.status = 404;
      throw err;
    }
    return course;
  },

  async adminDeleteCourse(id: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const course = await CourseModel.findByIdAndDelete(id, { session });
        if (!course) {
          const err: any = new Error('Không tìm thấy khóa học');
          err.status = 404;
          throw err;
        }

        await Promise.all([
          LessonModel.deleteMany({ courseId: id }, { session }),
          ReviewModel.deleteMany({ courseId: id }, { session }),
          EnrollmentModel.deleteMany({ courseId: id }, { session }),
          ProgressModel.deleteMany({ courseId: id }, { session }),
        ]);

        await StudentModel.updateMany(
          { enrolledCourses: new mongoose.Types.ObjectId(id) },
          { $pull: { enrolledCourses: new mongoose.Types.ObjectId(id) } },
          { session }
        );
      });
      invalidateAdminStatsCache();
    } finally {
      await session.endSession();
    }
  }
};
