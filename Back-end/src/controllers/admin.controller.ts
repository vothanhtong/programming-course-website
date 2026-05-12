import { Request, Response } from 'express';
import crypto from 'crypto';
import AdminModel from '../models/account.models/admin.model';
import StudentModel from '../models/student.model';
import CourseModel from '../models/course.models/course.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import { encodedToken, signAdminToken } from '../configs/jwt.config';
import { sendMail, newStudentAccountTemplate } from '../utils/mailer';
import logger from '../configs/logger';
import { getAdminId } from '../types';
import {
  EMAIL_REGEX, isValidId, getParam, sanitizeStr, isValidAvatarUrl, escapeRegex,
} from '../utils/validators';

const isProd = process.env.NODE_ENV === 'production';

// ── AUTH ──────────────────────────────────────────────────

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, password } = req.body as { userName: string; password: string };

    if (!userName?.trim() || !password) {
      res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' }); return;
    }

    const adminUser = await AdminModel.findOne({ userName: userName.trim() });
    // Timing-safe: không tiết lộ tài khoản có tồn tại hay không
    if (!adminUser) {
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' }); return;
    }

    const isMatch = await adminUser.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' }); return;
    }

    const token = signAdminToken(adminUser._id.toString());

    res.json({
      token,
      admin: {
        id:       adminUser._id,
        userName: adminUser.userName,
        fullName: adminUser.fullName,
        email:    adminUser.email,
        phone:    adminUser.phone,
        avatar:   adminUser.avatar,
        fb:       adminUser.fb,
      },
    });
  } catch (err) {
    logger.error('[postLogin]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const postLogout = (_req: Request, res: Response): void => {
  res.clearCookie('admin_token');
  res.json({ message: 'Đăng xuất thành công' });
};

// ── ADMIN PROFILE ─────────────────────────────────────────

export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await AdminModel.findById(getAdminId(req)).select('-password');
    if (!admin) { res.status(404).json({ message: 'Không tìm thấy admin' }); return; }
    res.json({ admin });
  } catch (err) {
    logger.error('[getAdminProfile]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, fb, address, avatar } = req.body as {
      fullName?: string; email?: string; phone?: string;
      fb?: string; address?: string; avatar?: string;
    };

    if (avatar !== undefined && !isValidAvatarUrl(avatar)) {
      res.status(400).json({ message: 'URL ảnh đại diện không hợp lệ' }); return;
    }

    const update: Record<string, string> = {};
    if (fullName?.trim()) update.fullName = sanitizeStr(fullName, 100);
    if (email?.trim()) {
      if (!EMAIL_REGEX.test(email)) { res.status(400).json({ message: 'Email không hợp lệ' }); return; }
      update.email = email.trim().toLowerCase();
    }
    if (phone !== undefined)   update.phone   = sanitizeStr(phone, 20);
    if (fb !== undefined)      update.fb      = sanitizeStr(fb, 200);
    if (address !== undefined) update.address = sanitizeStr(address, 200);
    if (avatar !== undefined)  update.avatar  = sanitizeStr(avatar, 500);

    const admin = await AdminModel.findByIdAndUpdate(getAdminId(req), update, { new: true }).select('-password');
    if (!admin) { res.status(404).json({ message: 'Không tìm thấy admin' }); return; }
    res.json({ message: 'Cập nhật thành công', admin });
  } catch (err) {
    logger.error('[updateAdminProfile]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string; newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' }); return;
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu mới phải từ 6 đến 128 ký tự' }); return;
    }

    const admin = await AdminModel.findById(getAdminId(req));
    if (!admin) { res.status(404).json({ message: 'Không tìm thấy admin' }); return; }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) { res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' }); return; }

    admin.password = newPassword; // pre-save hook trong model sẽ tự hash
    await admin.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    logger.error('[changeAdminPassword]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── STUDENT MANAGEMENT ────────────────────────────────────

export const adminGetStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage as string) || 20));
    const search  = sanitizeStr(req.query.search as string, 100);

    const filter: Record<string, unknown> = {};
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { fullName: { $regex: safe, $options: 'i' } },
        { email:    { $regex: safe, $options: 'i' } },
        { phone:    { $regex: safe, $options: 'i' } },
      ];
    }

    const [total, students] = await Promise.all([
      StudentModel.countDocuments(filter),
      StudentModel.find(filter)
        .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
        .populate('enrolledCourses', 'title slug thumbnail')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);

    res.json({ students, total, page, perPage });
  } catch (err) {
    logger.error('[adminGetStudents]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminGetStudentDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const student = await StudentModel.findById(id)
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail price')
      .lean();

    if (!student) { res.status(404).json({ message: 'Không tìm thấy học viên' }); return; }

    const studentEnrollments = await EnrollmentModel.find({ studentEmail: student.email })
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ student, enrollments: studentEnrollments });
  } catch (err) {
    logger.error('[adminGetStudentDetail]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminCreateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, courseIds, sendEmail } = req.body as {
      fullName: string; email: string; phone?: string;
      courseIds?: string[]; sendEmail?: boolean;
    };

    if (!fullName?.trim() || !email?.trim()) {
      res.status(400).json({ message: 'Vui lòng nhập họ tên và email' }); return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' }); return;
    }
    if (fullName.trim().length > 100) {
      res.status(400).json({ message: 'Họ tên quá dài' }); return;
    }

    const exists = await StudentModel.findOne({ email: email.toLowerCase() }).lean();
    if (exists) { res.status(409).json({ message: 'Email đã được đăng ký' }); return; }

    const rawPassword = crypto.randomBytes(5).toString('hex'); // 10 chars hex
    const validCourseIds = (courseIds || []).filter(id => isValidId(id));

    const student = await StudentModel.create({
      fullName:        sanitizeStr(fullName, 100),
      email:           email.toLowerCase().trim(),
      password:        rawPassword,
      phone:           sanitizeStr(phone || '', 20),
      isVerified:      true,
      enrolledCourses: validCourseIds,
    });

    // Tạo Enrollment record cho từng khóa học được cấp ngay lúc tạo tài khoản
    if (validCourseIds.length > 0) {
      const courses = await CourseModel.find({ _id: { $in: validCourseIds } })
        .select('title price salePrice isFree').lean();
      const enrollmentDocs = courses.map(c => ({
        courseId:      c._id,
        studentName:   student.fullName,
        studentEmail:  student.email,
        studentPhone:  sanitizeStr(phone || '', 20),
        paymentMethod: 'granted',
        amount:        0,
        paymentStatus: 'paid',
        note:          'Được cấp bởi admin',
      }));
      await EnrollmentModel.insertMany(enrollmentDocs, { ordered: false });
      // Cập nhật enrollmentCount cho từng course
      await CourseModel.updateMany(
        { _id: { $in: validCourseIds } },
        { $inc: { enrollmentCount: 1 } }
      );
    }

    if (sendEmail !== false) {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`;
      let courseName: string | undefined;
      if (validCourseIds.length) {
        const course = await CourseModel.findById(validCourseIds[0]).select('title').lean();
        courseName = course?.title;
      }
      await sendMail({
        to:      student.email,
        subject: '🎓 Tài khoản học tập High Sky của bạn',
        html:    newStudentAccountTemplate(student.fullName, student.email, rawPassword, loginUrl, courseName),
      });
    }

    res.status(201).json({
      message: 'Tạo tài khoản thành công' + (sendEmail !== false ? ' và đã gửi email' : ''),
      student: { id: student._id, fullName: student.fullName, email: student.email },
      // Chỉ trả tempPassword trong môi trường dev hoặc khi không gửi email
      ...((!isProd || sendEmail === false) && { tempPassword: rawPassword }),
    });
  } catch (err) {
    logger.error('[adminCreateStudent]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminUpdateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { fullName, phone, bio, avatar, isVerified } = req.body as {
      fullName?: string; phone?: string; bio?: string;
      avatar?: string; isVerified?: boolean;
    };

    if (avatar !== undefined && !isValidAvatarUrl(avatar)) {
      res.status(400).json({ message: 'URL ảnh đại diện không hợp lệ' }); return;
    }

    const update: Record<string, unknown> = {};
    if (fullName?.trim())        update.fullName   = sanitizeStr(fullName, 100);
    if (phone !== undefined)     update.phone      = sanitizeStr(phone, 20);
    if (bio !== undefined)       update.bio        = sanitizeStr(bio, 500);
    if (avatar !== undefined)    update.avatar     = sanitizeStr(avatar, 500);
    if (isVerified !== undefined) update.isVerified = Boolean(isVerified);

    const student = await StudentModel.findByIdAndUpdate(id, update, { new: true })
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry');
    if (!student) { res.status(404).json({ message: 'Không tìm thấy học viên' }); return; }
    res.json({ message: 'Cập nhật thành công', student });
  } catch (err) {
    logger.error('[adminUpdateStudent]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminResetStudentPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { newPassword, sendEmail: doSendEmail } = req.body as {
      newPassword?: string; sendEmail?: boolean;
    };

    const student = await StudentModel.findById(id);
    if (!student) { res.status(404).json({ message: 'Không tìm thấy học viên' }); return; }

    const rawPassword = newPassword?.trim() || crypto.randomBytes(5).toString('hex');
    if (rawPassword.length < 6 || rawPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu phải từ 6 đến 128 ký tự' }); return;
    }

    student.password = rawPassword;
    await student.save();

    if (doSendEmail !== false) {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`;
      await sendMail({
        to:      student.email,
        subject: '🔑 Mật khẩu mới - High Sky',
        html:    newStudentAccountTemplate(student.fullName, student.email, rawPassword, loginUrl),
      });
    }

    res.json({
      message: 'Đặt lại mật khẩu thành công',
      ...((!isProd || doSendEmail === false) && { tempPassword: rawPassword }),
    });
  } catch (err) {
    logger.error('[adminResetStudentPassword]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminGrantCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { courseIds } = req.body as { courseIds: string[] };
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 khóa học' }); return;
    }

    const validIds = courseIds.filter(cid => isValidId(cid));
    if (validIds.length === 0) {
      res.status(400).json({ message: 'Không có courseId hợp lệ' }); return;
    }

    const student = await StudentModel.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledCourses: { $each: validIds } } },
      { new: true }
    ).select('-password').populate('enrolledCourses', 'title slug thumbnail');

    if (!student) { res.status(404).json({ message: 'Không tìm thấy học viên' }); return; }

    // Tạo Enrollment record cho các khóa học chưa có (nhất quán với adminCreateStudent)
    const enrollmentDocs = validIds.map(cid => ({
      courseId:      cid,
      studentName:   student.fullName,
      studentEmail:  student.email,
      studentPhone:  student.phone || '',
      paymentMethod: 'granted',
      amount:        0,
      paymentStatus: 'paid',
      note:          'Được cấp bởi admin',
    }));
    await EnrollmentModel.insertMany(enrollmentDocs, { ordered: false });
    await CourseModel.updateMany(
      { _id: { $in: validIds } },
      { $inc: { enrollmentCount: 1 } }
    );

    res.json({ message: `Đã cấp ${validIds.length} khóa học`, student });
  } catch (err) {
    logger.error('[adminGrantCourses]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminRevokeCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id       = getParam(req.params.id);
    const courseId = getParam(req.params.courseId);
    if (!isValidId(id) || !isValidId(courseId)) {
      res.status(400).json({ message: 'ID không hợp lệ' }); return;
    }

    const student = await StudentModel.findByIdAndUpdate(
      id,
      { $pull: { enrolledCourses: courseId } },
      { new: true }
    ).select('-password').populate('enrolledCourses', 'title slug thumbnail');

    if (!student) { res.status(404).json({ message: 'Không tìm thấy học viên' }); return; }
    res.json({ message: 'Đã thu hồi khóa học', student });
  } catch (err) {
    logger.error('[adminRevokeCourse]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminDeleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }
    const student = await StudentModel.findByIdAndDelete(id);
    // Xóa enrollment liên quan để tránh dữ liệu mồ côi
    if (student) {
      await EnrollmentModel.deleteMany({ studentEmail: student.email });
    }
    res.json({ message: 'Đã xóa học viên' });
  } catch (err) {
    logger.error('[adminDeleteStudent]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
