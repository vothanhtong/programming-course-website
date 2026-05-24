import EnrollmentModel from '../models/course.models/enrollment.model';
import CourseModel from '../models/course.models/course.model';
import StudentModel from '../models/student.model';
import { initializeProgressForEnrollment } from '../controllers/progress.controller';
import { sendMail, enrollmentRequestTemplate, enrollmentApprovedTemplate } from '../utils/mailer';
import { isValidId } from '../utils/validators';
import { invalidateAdminStatsCache } from '../utils/cache';
import mongoose from 'mongoose';

export const enrollmentService = {
  async postEnroll(data: any, studentId?: string) {
    const course = await CourseModel.findById(data.courseId).select('title isPublished isFree price salePrice').lean();
    if (!course?.isPublished) {
      const err: any = new Error('Khóa học không tồn tại');
      err.status = 404;
      throw err;
    }

    let resolvedEmail = data.studentEmail.trim().toLowerCase();
    if (studentId && isValidId(studentId)) {
      const student = await StudentModel.findById(studentId).select('email').lean();
      if (student?.email) resolvedEmail = student.email;
    }

    const existing = await EnrollmentModel.findOne({
      courseId: data.courseId,
      studentEmail: resolvedEmail,
    });
    
    if (existing) {
      if (existing.paymentStatus === 'paid') {
        const err: any = new Error('Bạn đã đăng ký khóa học này rồi');
        err.status = 409;
        throw err;
      } else {
        // Cập nhật lại thông tin phòng trường hợp người dùng đổi phương thức thanh toán
        existing.studentName = data.studentName.trim();
        existing.studentPhone = data.studentPhone?.trim() || '';
        existing.paymentMethod = data.paymentMethod || 'other';
        existing.note = data.note?.trim() || '';
        existing.amount = course.salePrice != null ? course.salePrice : course.price;
        await existing.save();
        return existing.toObject();
      }
    }

    const amount = course.salePrice != null ? course.salePrice : course.price;
    const isFree = course.isFree;

    const session = await mongoose.startSession();
    try {
      let enrollment: any;
      await session.withTransaction(async () => {
        enrollment = await EnrollmentModel.create([{
          courseId: data.courseId,
          studentName: data.studentName.trim(),
          studentEmail: resolvedEmail,
          studentPhone: data.studentPhone?.trim() || '',
          paymentMethod: data.paymentMethod || 'other',
          amount,
          note: data.note?.trim() || '',
          paymentStatus: isFree ? 'paid' : 'pending',
        }], { session });

        if (isFree) {
          await CourseModel.updateOne({ _id: data.courseId }, { $inc: { enrollmentCount: 1 } }, { session });
          if (studentId && isValidId(studentId)) {
            await StudentModel.updateOne(
              { _id: studentId },
              { $addToSet: { enrolledCourses: data.courseId } },
              { session }
            );
            await initializeProgressForEnrollment(studentId, data.courseId, session);
          } else {
            await StudentModel.updateOne(
              { email: resolvedEmail },
              { $addToSet: { enrolledCourses: data.courseId } },
              { session }
            );
          }
        }
      });
      
      if (enrollment) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        if (isFree) {
          sendMail({
            to: enrollment[0].studentEmail,
            subject: `🎉 Yêu cầu đăng ký được phê duyệt`,
            html: enrollmentApprovedTemplate(enrollment[0].studentName, course.title, `${frontendUrl}/login`)
          });
        } else {
          sendMail({
            to: enrollment[0].studentEmail,
            subject: `📄 Xác nhận yêu cầu đăng ký khóa học`,
            html: enrollmentRequestTemplate(enrollment[0].studentName, course.title, amount)
          });
        }
      }

      return enrollment ? enrollment[0] : null;
    } finally {
      await session.endSession();
    }
  },

  async adminGetEnrollments(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(query.perPage as string) || 20));
    
    const filter: Record<string, unknown> = {};
    if (query.courseId && isValidId(query.courseId)) filter.courseId = query.courseId;
    if (query.status) filter.paymentStatus = query.status;

    const [total, enrollments] = await Promise.all([
      EnrollmentModel.countDocuments(filter),
      EnrollmentModel.find(filter).populate('courseId', 'title')
        .sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    ]);

    return { enrollments, total };
  },

  async adminDeleteEnrollment(id: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const enrollment = await EnrollmentModel.findByIdAndDelete(id, { session });
        if (!enrollment) {
          const err: any = new Error('Không tìm thấy đăng ký');
          err.status = 404;
          throw err;
        }

        if (enrollment.paymentStatus === 'paid') {
          await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: -1 } }, { session });
          await StudentModel.updateOne(
            { email: enrollment.studentEmail },
            { $pull: { enrolledCourses: enrollment.courseId } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async adminUpdateEnrollment(id: string, paymentStatus: string) {
    const session = await mongoose.startSession();
    try {
      let enrollment: any;
      let course: any;
      let shouldSendEmail = false;
      await session.withTransaction(async () => {
        enrollment = await EnrollmentModel.findById(id).session(session);
        if (!enrollment) {
          const err: any = new Error('Không tìm thấy');
          err.status = 404;
          throw err;
        }

        course = await CourseModel.findById(enrollment.courseId).select('title').session(session).lean();

        const wasPaid = enrollment.paymentStatus === 'paid';
        const nowPaid = paymentStatus === 'paid';
        enrollment.paymentStatus = paymentStatus as any;
        await enrollment.save({ session });

        if (!wasPaid && nowPaid) {
          shouldSendEmail = true;
          await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: 1 } }, { session });
          await StudentModel.updateOne(
            { email: enrollment.studentEmail },
            { $addToSet: { enrolledCourses: enrollment.courseId } },
            { session }
          );
          invalidateAdminStatsCache();
        }
        
        if (wasPaid && !nowPaid) {
          await CourseModel.updateOne({ _id: enrollment.courseId }, { $inc: { enrollmentCount: -1 } }, { session });
          await StudentModel.updateOne(
            { email: enrollment.studentEmail },
            { $pull: { enrolledCourses: enrollment.courseId } },
            { session }
          );
          invalidateAdminStatsCache();
        }
      });

      if (shouldSendEmail && enrollment && course) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        sendMail({
          to: enrollment.studentEmail,
          subject: `🎉 Yêu cầu đăng ký được phê duyệt`,
          html: enrollmentApprovedTemplate(enrollment.studentName, course.title, `${frontendUrl}/login`)
        });
      }

      return enrollment;
    } finally {
      await session.endSession();
    }
  },

  async adminGetEnrollmentsByMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const data = await EnrollmentModel.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const result: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = data.find((x: any) => x._id.year === year && x._id.month === month);
      result.push({ month: `T${month}/${String(year).slice(2)}`, count: found?.count || 0 });
    }

    return result;
  }
};
