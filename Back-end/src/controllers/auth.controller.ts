import { Request, Response } from 'express';
import crypto from 'crypto';
import { signStudentToken } from '../configs/jwt.config';
import StudentModel from '../models/student.model';
import { sendMail, resetPasswordTemplate } from '../utils/mailer';
import logger from '../configs/logger';
import { getStudentId } from '../types';
import {
  EMAIL_REGEX, isValidAvatarUrl, sanitizeStr,
} from '../utils/validators';

const signToken = (studentId: string): string => signStudentToken(studentId);

// ── Public ────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body as {
      fullName: string; email: string; password: string;
    };

    if (!fullName?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' }); return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' }); return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự' }); return;
    }
    if (fullName.trim().length > 100) {
      res.status(400).json({ message: 'Họ tên quá dài' }); return;
    }

    const exists = await StudentModel.findOne({ email: email.toLowerCase() }).lean();
    if (exists) {
      res.status(409).json({ message: 'Email đã được đăng ký' }); return;
    }

    const student = await StudentModel.create({
      fullName: sanitizeStr(fullName, 100),
      email:    email.toLowerCase().trim(),
      password,
      isVerified: true,
    });

    const token = signToken(student._id.toString());
    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      student: {
        id:       student._id,
        fullName: student.fullName,
        email:    student.email,
        avatar:   student.avatar,
      },
    });
  } catch (err) {
    logger.error('[register]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' }); return;
    }

    const student = await StudentModel.findOne({ email: email.toLowerCase().trim() });
    if (!student) {
      // Timing-safe: không tiết lộ email có tồn tại hay không
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' }); return;
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' }); return;
    }

    const token = signToken(student._id.toString());
    res.json({
      message: 'Đăng nhập thành công!',
      token,
      student: {
        id:       student._id,
        fullName: student.fullName,
        email:    student.email,
        avatar:   student.avatar,
        phone:    student.phone,
        bio:      student.bio,
      },
    });
  } catch (err) {
    logger.error('[login]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── Protected ─────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await StudentModel.findById(getStudentId(req))
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry')
      .populate('enrolledCourses', 'title slug thumbnail')
      .lean();
    if (!student) { res.status(404).json({ message: 'Không tìm thấy tài khoản' }); return; }
    res.json({ student });
  } catch (err) {
    logger.error('[getMe]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, bio, avatar } = req.body as {
      fullName?: string; phone?: string; bio?: string; avatar?: string;
    };

    // Validate avatar URL nếu có
    if (avatar !== undefined && !isValidAvatarUrl(avatar)) {
      res.status(400).json({ message: 'URL ảnh đại diện không hợp lệ' }); return;
    }

    const update: Record<string, string> = {};
    if (fullName?.trim()) {
      if (fullName.trim().length > 100) { res.status(400).json({ message: 'Họ tên quá dài' }); return; }
      update.fullName = sanitizeStr(fullName, 100);
    }
    if (phone !== undefined)  update.phone  = sanitizeStr(phone, 20);
    if (bio !== undefined)    update.bio    = sanitizeStr(bio, 500);
    if (avatar !== undefined) update.avatar = sanitizeStr(avatar, 500);

    const student = await StudentModel.findByIdAndUpdate(getStudentId(req), update, { new: true })
      .select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry');
    if (!student) { res.status(404).json({ message: 'Không tìm thấy tài khoản' }); return; }
    res.json({ message: 'Cập nhật thành công', student });
  } catch (err) {
    logger.error('[updateProfile]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string; newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' }); return;
    }
    if (newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu quá dài' }); return;
    }

    const student = await StudentModel.findById(getStudentId(req));
    if (!student) { res.status(404).json({ message: 'Không tìm thấy tài khoản' }); return; }

    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' }); return;
    }

    student.password = newPassword;
    await student.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    logger.error('[changePassword]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    if (!email?.trim()) { res.status(400).json({ message: 'Vui lòng nhập email' }); return; }

    // Luôn trả về cùng message để tránh email enumeration
    const genericMsg = 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.';

    const student = await StudentModel.findOne({ email: email.toLowerCase().trim() });
    if (!student) { res.json({ message: genericMsg }); return; }

    const token = crypto.randomBytes(32).toString('hex');
    student.resetToken       = token;
    student.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
    await student.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl    = `${frontendUrl}/reset-password?token=${token}`;

    const sent = await sendMail({
      to:      student.email,
      subject: 'Đặt lại mật khẩu - High Sky',
      html:    resetPasswordTemplate(resetUrl, student.fullName),
    });

    // KHÔNG log reset URL ra console trong production
    if (!sent && process.env.NODE_ENV !== 'production') {
      logger.warn(`[forgotPassword] SMTP chưa cấu hình. Token cho ${email} đã được tạo.`);
    }

    res.json({ message: genericMsg });
  } catch (err) {
    logger.error('[forgotPassword]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Thiếu thông tin' }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự' }); return;
    }
    if (newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu quá dài' }); return;
    }
    // Validate token format (hex 64 chars)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      res.status(400).json({ message: 'Token không hợp lệ' }); return;
    }

    const student = await StudentModel.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!student) {
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' }); return;
    }

    student.password         = newPassword;
    student.resetToken       = undefined;
    student.resetTokenExpiry = undefined;
    await student.save();

    res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    logger.error('[resetPassword]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
