import crypto from 'crypto';
import mongoose from 'mongoose';
import StudentModel from '../models/student.model';
import CourseModel from '../models/course.models/course.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import ProgressModel from '../models/course.models/progress.model';
import { sendMail, newStudentAccountTemplate } from '../utils/mailer';
import { escapeRegex } from '../utils/validators';
import { invalidateAdminStatsCache } from '../utils/cache';

export const studentService = {
  async adminGetStudents(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(query.perPage as string) || 20));
    
    const filter: Record<string, unknown> = {};
    if (query.search) {
      const safe = escapeRegex(query.search);
      filter.$or = [
        { fullName: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
        { phone: { $regex: safe, $options: 'i' } },
      ];
    }

    const [total, students] = await Promise.all([
      StudentModel.countDocuments(filter),
      StudentModel.find(filter)
        .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);

    const studentsWithCount = students.map((student: any) => ({
      ...student,
      enrolledCoursesCount: student.enrolledCourses?.length || 0,
    }));

    return { students: studentsWithCount, total, page, perPage };
  },

  async adminGetStudentDetail(id: string) {
    const student = await StudentModel.findById(id)
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail price')
      .lean();

    if (!student) {
      const err: any = new Error('Không tìm thấy học viên');
      err.status = 404;
      throw err;
    }

    const enrollments = await EnrollmentModel.find({ studentEmail: student.email })
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return { student, enrollments };
  },

  async adminCreateStudent(data: any, frontendUrl: string, isProd: boolean) {
    const exists = await StudentModel.findOne({ email: data.email }).lean();
    if (exists) {
      const err: any = new Error('Email đã được đăng ký');
      err.status = 409;
      throw err;
    }

    const session = await mongoose.startSession();
    try {
      let student: any;
      let rawPassword = crypto.randomBytes(5).toString('hex');
      await session.withTransaction(async () => {
        const studentDocs = await StudentModel.create([{
          fullName: data.fullName,
          email: data.email,
          password: rawPassword,
          phone: data.phone || '',
          isVerified: true,
          enrolledCourses: data.validCourseIds,
        }], { session });
        student = studentDocs[0];

        if (data.validCourseIds.length > 0) {
          const courses = await CourseModel.find({ _id: { $in: data.validCourseIds } })
            .session(session).select('title price salePrice isFree').lean();
            
          const enrollmentDocs = courses.map(c => ({
            courseId: c._id,
            studentName: student.fullName,
            studentEmail: student.email,
            studentPhone: student.phone || '',
            paymentMethod: 'granted',
            amount: 0,
            paymentStatus: 'paid',
            note: 'Được cấp bởi admin',
          }));
          await EnrollmentModel.insertMany(enrollmentDocs, { session, ordered: false });
          
          await CourseModel.updateMany(
            { _id: { $in: data.validCourseIds } },
            { $inc: { enrollmentCount: 1 } },
            { session }
          );
          invalidateAdminStatsCache();
        }
      });

    if (data.sendEmail !== false) {
      const loginUrl = `${frontendUrl}/login`;
      let courseName: string | undefined;
      if (data.validCourseIds.length) {
        const course = await CourseModel.findById(data.validCourseIds[0]).select('title').lean();
        courseName = course?.title;
      }
      await sendMail({
        to: student.email,
        subject: '🎓 Tài khoản học tập Khóa Lập Trình của bạn',
        html: newStudentAccountTemplate(student.fullName, student.email, rawPassword, loginUrl, courseName),
      });
    }

    return {
      student: { id: student._id, fullName: student.fullName, email: student.email },
      tempPassword: (!isProd || data.sendEmail === false) ? rawPassword : undefined
    };
    } finally {
      await session.endSession();
    }
  },

  async adminUpdateStudent(id: string, updateData: any) {
    const student = await StudentModel.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry');
      
    if (!student) {
      const err: any = new Error('Không tìm thấy học viên');
      err.status = 404;
      throw err;
    }
    return student;
  },

  async adminResetStudentPassword(id: string, data: any, frontendUrl: string, isProd: boolean) {
    const student = await StudentModel.findById(id);
    if (!student) {
      const err: any = new Error('Không tìm thấy học viên');
      err.status = 404;
      throw err;
    }

    const rawPassword = data.newPassword || crypto.randomBytes(5).toString('hex');
    student.password = rawPassword;
    await student.save();

    if (data.sendEmail !== false) {
      const loginUrl = `${frontendUrl}/login`;
      await sendMail({
        to: student.email,
        subject: '🔑 Mật khẩu mới - Khóa Lập Trình',
        html: newStudentAccountTemplate(student.fullName, student.email, rawPassword, loginUrl),
      });
    }

    return {
      tempPassword: (!isProd || data.sendEmail === false) ? rawPassword : undefined
    };
  },

  async adminGrantCourses(id: string, validIds: string[]) {
    const session = await mongoose.startSession();
    try {
      let student: any;
      await session.withTransaction(async () => {
        student = await StudentModel.findByIdAndUpdate(
          id,
          { $addToSet: { enrolledCourses: { $each: validIds } } },
          { new: true, session }
        ).select('-password').populate('enrolledCourses', 'title slug thumbnail');

        if (!student) {
          const err: any = new Error('Không tìm thấy học viên');
          err.status = 404;
          throw err;
        }

        const enrollmentDocs = validIds.map(cid => ({
          courseId: cid,
          studentName: student.fullName,
          studentEmail: student.email,
          studentPhone: student.phone || '',
          paymentMethod: 'granted',
          amount: 0,
          paymentStatus: 'paid',
          note: 'Được cấp bởi admin',
        }));
        await EnrollmentModel.insertMany(enrollmentDocs, { session, ordered: false });
        
        await CourseModel.updateMany(
          { _id: { $in: validIds } },
          { $inc: { enrollmentCount: 1 } },
          { session }
        );
        
        invalidateAdminStatsCache();
      });

      return student;
    } finally {
      await session.endSession();
    }
  },

  async adminRevokeCourse(id: string, courseId: string) {
    const session = await mongoose.startSession();
    try {
      let updatedStudent;
      await session.withTransaction(async () => {
        const student = await StudentModel.findById(id).select('email enrolledCourses').session(session).lean();
        if (!student) {
          const err: any = new Error('Không tìm thấy học viên');
          err.status = 404;
          throw err;
        }

        await StudentModel.updateOne(
          { _id: id },
          { $pull: { enrolledCourses: new mongoose.Types.ObjectId(courseId) } },
          { session }
        );

        const deletedEnrollment = await EnrollmentModel.findOneAndDelete(
          { courseId, studentEmail: student.email, paymentStatus: { $in: ['paid', 'granted'] } },
          { session }
        );

        if (deletedEnrollment) {
          await CourseModel.updateOne(
            { _id: courseId },
            { $inc: { enrollmentCount: -1 } },
            { session }
          );
          invalidateAdminStatsCache();
        }

        await ProgressModel.deleteOne({ studentId: id, courseId }, { session });
      });

      updatedStudent = await StudentModel.findById(id)
        .select('-password')
        .populate('enrolledCourses', 'title slug thumbnail');
        
      if (!updatedStudent) {
        const err: any = new Error('Không tìm thấy học viên');
        err.status = 404;
        throw err;
      }
      
      return updatedStudent;
    } finally {
      await session.endSession();
    }
  },

  async adminDeleteStudent(id: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const student = await StudentModel.findByIdAndDelete(id, { session });
        if (!student) {
          const err: any = new Error('Không tìm thấy học viên');
          err.status = 404;
          throw err;
        }

        await Promise.all([
          EnrollmentModel.deleteMany({ studentEmail: student.email }, { session }),
          ProgressModel.deleteMany({ studentId: id }, { session }),
        ]);
        invalidateAdminStatsCache();
      });
    } finally {
      await session.endSession();
    }
  }
};
