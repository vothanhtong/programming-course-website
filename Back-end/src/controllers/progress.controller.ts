import { Request, Response } from 'express';
import ProgressModel from '../models/course.models/progress.model';
import LessonModel from '../models/course.models/lesson.model';
import CourseModel from '../models/course.models/course.model';
import StudentModel from '../models/student.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import logger from '../configs/logger';
import { getStudentId } from '../types';
import { isValidId } from '../utils/validators';

// ── STUDENT: Lấy khóa học đã đăng ký (My Courses) ──────
export const getMyEnrolledCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const student = await StudentModel.findById(studentId)
      .populate({
        path: 'enrolledCourses',
        select: 'title slug thumbnail rating ratingCount price salePrice level isFree',
      })
      .lean();

    if (!student) {
      res.status(404).json({ message: 'Học viên không tồn tại' });
      return;
    }

    // Lấy tiến độ cho mỗi khóa
    const progressData = await ProgressModel.find({
      studentId,
      courseId: { $in: student.enrolledCourses.map(c => c._id) },
    }).lean();

    const coursesWithProgress = (student.enrolledCourses as any[]).map(course => {
      const progress = progressData.find(p => p.courseId.toString() === course._id.toString());
      return {
        ...course,
        progressPercentage: progress?.progressPercentage || 0,
        isCompleted: progress?.isCompleted || false,
        completedLessons: progress?.completedLessons || 0,
        totalLessons: progress?.totalLessons || 0,
      };
    });

    res.json({ courses: coursesWithProgress });
  } catch (err) {
    logger.error('[getMyEnrolledCourses]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── STUDENT: Lấy tiến độ chi tiết khóa học ──────
export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    const { courseId } = req.params;

    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    if (!isValidId(courseId)) {
      res.status(400).json({ message: 'Course ID không hợp lệ' });
      return;
    }

    const progress = await ProgressModel.findOne({ studentId, courseId })
      .populate({
        path: 'lessonsProgress.lessonId',
        select: 'title duration order videoUrl',
      })
      .lean();

    if (!progress) {
      res.status(404).json({ message: 'Chưa đăng ký khóa học này' });
      return;
    }

    res.json({ progress });
  } catch (err) {
    logger.error('[getCourseProgress]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── STUDENT: Cập nhật tiến độ bài học (mark as complete) ──────
export const updateLessonProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    const { courseId, lessonId } = req.params;
    const { watchedSeconds, completed } = req.body;

    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    if (!isValidId(courseId) || !isValidId(lessonId)) {
      res.status(400).json({ message: 'ID không hợp lệ' });
      return;
    }

    // ── SECURITY: Verify student đã enroll khóa học này ──────────
    const student = await StudentModel.findById(studentId).select('enrolledCourses email').lean();
    if (!student) {
      res.status(404).json({ message: 'Học viên không tồn tại' });
      return;
    }

    const isEnrolled = (student.enrolledCourses as any[]).some(
      (id: any) => id.toString() === courseId
    );

    if (!isEnrolled) {
      // Double-check qua EnrollmentModel với paymentStatus = paid
      const paidEnrollment = await EnrollmentModel.findOne({
        courseId,
        studentEmail: student.email,
        paymentStatus: 'paid',
      }).lean();

      if (!paidEnrollment) {
        res.status(403).json({ message: 'Bạn chưa đăng ký khóa học này' });
        return;
      }
    }
    // ─────────────────────────────────────────────────────────────

    // Kiểm tra bài học tồn tại
    const lesson = await LessonModel.findById(lessonId).select('duration').lean();
    if (!lesson) {
      res.status(404).json({ message: 'Bài học không tồn tại' });
      return;
    }

    // Lấy hoặc tạo progress record
    let progress = await ProgressModel.findOne({ studentId, courseId });
    if (!progress) {
      // Tạo progress mới nếu chưa có
      const course = await CourseModel.findById(courseId).select('title').lean();
      if (!course) {
        res.status(404).json({ message: 'Khóa học không tồn tại' });
        return;
      }

      const lessons = await LessonModel.find({ courseId }).select('_id duration').lean();
      progress = await ProgressModel.create({
        studentId,
        courseId,
        totalLessons: lessons.length,
        completedLessons: 0,
        progressPercentage: 0,
        lessonsProgress: lessons.map(l => ({
          lessonId: l._id,
          completed: false,
          watchedSeconds: 0,
          totalSeconds: l.duration || 0,
        })),
      });
    }

    // Cập nhật tiến độ bài học
    const lessonProgressIndex = (progress.lessonsProgress as any[]).findIndex(
      lp => lp.lessonId.toString() === lessonId
    );

    if (lessonProgressIndex === -1) {
      res.status(404).json({ message: 'Bài học không trong khóa này' });
      return;
    }

    const lessonProgress = (progress.lessonsProgress as any)[lessonProgressIndex];
    const wasCompleted = lessonProgress.completed;

    if (watchedSeconds !== undefined) {
      lessonProgress.watchedSeconds = Math.max(0, watchedSeconds);
    }

    if (completed !== undefined) {
      lessonProgress.completed = completed;
      if (completed && !wasCompleted) {
        lessonProgress.completedAt = new Date();
      }
    }

    // Tính toán % hoàn thành
    const completedCount = (progress.lessonsProgress as any[]).filter(
      lp => lp.completed
    ).length;
    progress.completedLessons = completedCount;
    progress.progressPercentage = progress.totalLessons > 0
      ? Math.round((completedCount / progress.totalLessons) * 100)
      : 0;

    if (progress.progressPercentage === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    res.json({
      message: 'Cập nhật tiến độ thành công',
      progress: {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons,
        totalLessons: progress.totalLessons,
        isCompleted: progress.isCompleted,
      },
    });
  } catch (err) {
    logger.error('[updateLessonProgress]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── STUDENT: Lấy dashboard thống kê học tập ──────
export const getStudentLearningStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const progressRecords = await ProgressModel.find({ studentId }).lean();

    const stats = {
      totalEnrolled: progressRecords.length,
      totalCompleted: progressRecords.filter(p => p.isCompleted).length,
      totalLessons: progressRecords.reduce((sum, p) => sum + p.totalLessons, 0),
      totalLessonsCompleted: progressRecords.reduce((sum, p) => sum + p.completedLessons, 0),
      averageProgress: progressRecords.length > 0
        ? Math.round(
          progressRecords.reduce((sum, p) => sum + p.progressPercentage, 0) /
            progressRecords.length
        )
        : 0,
      inProgress: progressRecords.filter(
        p => !p.isCompleted && p.progressPercentage > 0
      ).length,
      notStarted: progressRecords.filter(p => p.progressPercentage === 0).length,
    };

    res.json({ stats });
  } catch (err) {
    logger.error('[getStudentLearningStats]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── ADMIN: Lấy tiến độ học viên trong khóa ──────
export const adminGetStudentProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 20));

    if (!isValidId(courseId)) {
      res.status(400).json({ message: 'Course ID không hợp lệ' });
      return;
    }

    const [total, progressRecords] = await Promise.all([
      ProgressModel.countDocuments({ courseId }),
      ProgressModel.find({ courseId })
        .populate('studentId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
    ]);

    res.json({ progressRecords, total, page, perPage });
  } catch (err) {
    logger.error('[adminGetStudentProgress]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── Khởi tạo progress khi enrollment thành công ──────
export const initializeProgressForEnrollment = async (
  studentId: string,
  courseId: string
): Promise<void> => {
  try {
    // Kiểm tra progress đã tồn tại chưa
    const existing = await ProgressModel.findOne({ studentId, courseId }).lean();
    if (existing) return;

    // Lấy tất cả bài học của khóa
    const lessons = await LessonModel.find({ courseId }).select('_id duration').lean();

    if (lessons.length === 0) return;

    // Tạo progress record
    await ProgressModel.create({
      studentId,
      courseId,
      totalLessons: lessons.length,
      completedLessons: 0,
      progressPercentage: 0,
      lessonsProgress: lessons.map(l => ({
        lessonId: l._id,
        completed: false,
        watchedSeconds: 0,
        totalSeconds: l.duration || 0,
      })),
    });
  } catch (err) {
    logger.error('[initializeProgressForEnrollment]', err);
  }
};
