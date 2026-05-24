import crypto from 'crypto';
import StudentModel from '../models/student.model';
import { sendMail, resetPasswordTemplate } from '../utils/mailer';
import { signStudentToken } from '../config/jwt.config';
import { sanitizeStr } from '../utils/validators';

const signToken = (studentId: string): string => signStudentToken(studentId);

export const authService = {
  async register(data: any) {
    const exists = await StudentModel.findOne({ email: data.email }).lean();
    if (exists) {
      const err: any = new Error('Email đã được đăng ký');
      err.status = 409;
      throw err;
    }

    const student = await StudentModel.create({
      fullName: sanitizeStr(data.fullName, 100),
      email: data.email,
      password: data.password,
      isVerified: true,
    });

    const token = signToken(student._id.toString());
    const populated = await StudentModel.findById(student._id)
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail')
      .lean();

    return { token, student: populated };
  },

  async login(data: any) {
    const student = await StudentModel.findOne({ email: data.email });
    if (!student) {
      const err: any = new Error('Email hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    const isMatch = await student.comparePassword(data.password);
    if (!isMatch) {
      const err: any = new Error('Email hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    const token = signToken(student._id.toString());
    const populated = await StudentModel.findById(student._id)
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail')
      .lean();

    return { token, student: populated };
  },

  async getMe(studentId: string) {
    const student = await StudentModel.findById(studentId)
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail')
      .lean();
    
    if (!student) {
      const err: any = new Error('Không tìm thấy tài khoản');
      err.status = 404;
      throw err;
    }
    return student;
  },

  async updateProfile(studentId: string, updateData: any) {
    const student = await StudentModel.findByIdAndUpdate(studentId, updateData, { new: true })
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry');
      
    if (!student) {
      const err: any = new Error('Không tìm thấy tài khoản');
      err.status = 404;
      throw err;
    }
    return student;
  },

  async changePassword(studentId: string, data: any) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      const err: any = new Error('Không tìm thấy tài khoản');
      err.status = 404;
      throw err;
    }

    const isMatch = await student.comparePassword(data.currentPassword);
    if (!isMatch) {
      const err: any = new Error('Mật khẩu hiện tại không đúng');
      err.status = 401;
      throw err;
    }

    student.password = data.newPassword;
    await student.save();
  },

  async forgotPassword(email: string, frontendUrl: string) {
    const student = await StudentModel.findOne({ email });
    if (!student) return false;

    const token = crypto.randomBytes(32).toString('hex');
    student.resetToken = token;
    student.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await student.save();

    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await sendMail({
      to: student.email,
      subject: 'Đặt lại mật khẩu - Khóa Lập Trình',
      html: resetPasswordTemplate(resetUrl, student.fullName),
    });
    
    return true;
  },

  async resetPassword(data: any) {
    const student = await StudentModel.findOne({
      resetToken: data.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!student) {
      const err: any = new Error('Token không hợp lệ hoặc đã hết hạn');
      err.status = 400;
      throw err;
    }

    student.password = data.newPassword;
    student.resetToken = null as any;
    student.resetTokenExpiry = null as any;
    await student.save();
  }
};
