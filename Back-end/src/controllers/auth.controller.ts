import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { getStudentId } from '../types';
import { EMAIL_REGEX, isValidAvatarUrl, sanitizeStr } from '../utils/validators';
import { authService } from '../services/auth.service';
import { verifyRefreshToken, signStudentToken } from '../config/jwt.config';
import StudentModel from '../models/student.model';

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

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

    const { refreshToken, ...result } = await authService.register({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' }); return;
    }

    const { refreshToken, ...result } = await authService.login({
      email: email.toLowerCase().trim(),
      password
    });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Đăng nhập thành công!',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearRefreshTokenCookie(res);
  res.json({ message: 'Đăng xuất thành công' });
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token không tồn tại' });
      return;
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken, 'student');
    } catch (err) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
      return;
    }

    const studentId = decoded.sub?.studentId;
    if (!studentId) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: 'Token payload không hợp lệ' });
      return;
    }

    const student = await StudentModel.findById(studentId).lean();
    if (!student) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: 'Tài khoản không tồn tại' });
      return;
    }

    const newToken = signStudentToken(studentId);
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await authService.getMe(getStudentId(req));
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phone, bio, avatar } = req.body;

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

    const student = await authService.updateProfile(getStudentId(req), update);
    res.json({ message: 'Cập nhật thành công', student });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' }); return;
    }
    if (newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu quá dài' }); return;
    }

    await authService.changePassword(getStudentId(req), { currentPassword, newPassword });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400).json({ message: 'Vui lòng nhập email' }); return; }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    
    await authService.forgotPassword(email.toLowerCase().trim(), frontendUrl);
    
    res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Thiếu thông tin' }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự' }); return;
    }
    if (newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu quá dài' }); return;
    }
    if (!/^[a-f0-9]{64}$/.test(token)) {
      res.status(400).json({ message: 'Token không hợp lệ' }); return;
    }

    await authService.resetPassword({ token, newPassword });
    res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    next(err);
  }
};
