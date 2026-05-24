import ProgressModel from '../models/course.models/progress.model';
import LessonModel from '../models/course.models/lesson.model';
import CourseModel from '../models/course.models/course.model';
import StudentModel from '../models/student.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import mongoose from 'mongoose';

export const progressService = {
  async getMyEnrolledCourses(studentId: string) {
    const student = await StudentModel.findById(studentId)
      .populate({
        path: 'enrolledCourses',
        select: 'title slug thumbnail rating ratingCount price salePrice level isFree',
      })
      .lean();

    if (!student) {
      const err: any = new Error('Học viên không tồn tại');
      err.status = 404;
      throw err;
    }

    const progressData = await ProgressModel.find({
      studentId,
      courseId: { $in: student.enrolledCourses.map((c: any) => c._id) },
    }).lean();

    const coursesWithProgress = (student.enrolledCourses as any[]).map(course => {
      const progress = progressData.find((p: any) => p.courseId.toString() === course._id.toString());
      return {
        ...course,
        progressPercentage: progress?.progressPercentage || 0,
        isCompleted: progress?.isCompleted || false,
        completedLessons: progress?.completedLessons || 0,
        totalLessons: progress?.totalLessons || 0,
      };
    });

    return { courses: coursesWithProgress };
  },

  async getCourseProgress(studentId: string, courseId: string) {
    const progress = await ProgressModel.findOne({ studentId, courseId })
      .populate({
        path: 'lessonsProgress.lessonId',
        select: 'title duration order videoUrl',
      })
      .lean();

    if (!progress) {
      const err: any = new Error('Chưa đăng ký khóa học này');
      err.status = 404;
      throw err;
    }

    return { progress };
  },

  async updateLessonProgress(studentId: string, courseId: string, lessonId: string, data: any) {
    const student = await StudentModel.findById(studentId).select('enrolledCourses email').lean();
    if (!student) {
      const err: any = new Error('Học viên không tồn tại');
      err.status = 404;
      throw err;
    }

    const isEnrolled = (student.enrolledCourses as any[]).some(
      (id: any) => id.toString() === courseId
    );

    if (!isEnrolled) {
      const paidEnrollment = await EnrollmentModel.findOne({
        courseId,
        studentEmail: student.email,
        paymentStatus: 'paid',
      }).lean();

      if (!paidEnrollment) {
        const err: any = new Error('Bạn chưa đăng ký khóa học này');
        err.status = 403;
        throw err;
      }
    }

    const lesson = await LessonModel.findById(lessonId).select('duration').lean();
    if (!lesson) {
      const err: any = new Error('Bài học không tồn tại');
      err.status = 404;
      throw err;
    }

    let progress = await ProgressModel.findOne({ studentId, courseId });
    if (!progress) {
      const course = await CourseModel.findById(courseId).select('title').lean();
      if (!course) {
        const err: any = new Error('Khóa học không tồn tại');
        err.status = 404;
        throw err;
      }

      const lessons = await LessonModel.find({ courseId }).select('_id duration').lean();
      progress = await ProgressModel.create({
        studentId,
        courseId,
        totalLessons: lessons.length,
        completedLessons: 0,
        progressPercentage: 0,
        lessonsProgress: lessons.map((l: any) => ({
          lessonId: l._id,
          completed: false,
          watchedSeconds: 0,
          totalSeconds: l.duration || 0,
        })),
      });
    }

    const lessonProgressIndex = (progress.lessonsProgress as any[]).findIndex(
      (lp: any) => lp.lessonId.toString() === lessonId
    );

    if (lessonProgressIndex === -1) {
      const err: any = new Error('Bài học không trong khóa này');
      err.status = 404;
      throw err;
    }

    const lessonProgress = (progress.lessonsProgress as any)[lessonProgressIndex];
    const wasCompleted = lessonProgress.completed;

    if (data.watchedSeconds !== undefined) {
      lessonProgress.watchedSeconds = Math.max(0, data.watchedSeconds);
    }

    if (data.completed !== undefined) {
      lessonProgress.completed = data.completed;
      if (data.completed && !wasCompleted) {
        lessonProgress.completedAt = new Date();
      }
    }

    const completedCount = (progress.lessonsProgress as any[]).filter(
      (lp: any) => lp.completed
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

    return {
      progressPercentage: progress.progressPercentage,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      isCompleted: progress.isCompleted,
    };
  },

  async getStudentLearningStats(studentId: string) {
    const progressRecords = await ProgressModel.find({ studentId }).lean();

    const stats = {
      totalEnrolled: progressRecords.length,
      totalCompleted: progressRecords.filter((p: any) => p.isCompleted).length,
      totalLessons: progressRecords.reduce((sum: number, p: any) => sum + p.totalLessons, 0),
      totalLessonsCompleted: progressRecords.reduce((sum: number, p: any) => sum + p.completedLessons, 0),
      averageProgress: progressRecords.length > 0
        ? Math.round(
          progressRecords.reduce((sum: number, p: any) => sum + p.progressPercentage, 0) /
            progressRecords.length
        )
        : 0,
      inProgress: progressRecords.filter(
        (p: any) => !p.isCompleted && p.progressPercentage > 0
      ).length,
      notStarted: progressRecords.filter((p: any) => p.progressPercentage === 0).length,
    };

    return { stats };
  },

  async adminGetStudentProgress(courseId: string, query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(query.perPage as string) || 20));

    const [total, progressRecords] = await Promise.all([
      ProgressModel.countDocuments({ courseId }),
      ProgressModel.find({ courseId })
        .populate('studentId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
    ]);

    return { progressRecords, total, page, perPage };
  }
};

export const initializeProgressForEnrollment = async (
  studentId: string,
  courseId: string,
  session?: mongoose.mongo.ClientSession
): Promise<void> => {
  try {
    const existing = await ProgressModel.findOne({ studentId, courseId }).session(session || null).lean();
    if (existing) return;

    const lessons = await LessonModel.find({ courseId }).session(session || null).select('_id duration').lean();

    if (lessons.length === 0) return;

    await ProgressModel.create([{
      studentId,
      courseId,
      totalLessons: lessons.length,
      completedLessons: 0,
      progressPercentage: 0,
      lessonsProgress: lessons.map((l: any) => ({
        lessonId: l._id,
        completed: false,
        watchedSeconds: 0,
        totalSeconds: l.duration || 0,
      })),
    }], { session });
  } catch (err) {
    console.error('[initializeProgressForEnrollment]', err);
  }
};
