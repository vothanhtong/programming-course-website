import { Request, Response, NextFunction } from 'express';
import { getAdminId } from '../types';
import { EMAIL_REGEX, isValidId, getParam, isValidAvatarUrl, sanitizeStr } from '../utils/validators';
import { adminService } from '../services/admin.service';
import { studentService } from '../services/student.service';
import { verifyRefreshToken, signAdminToken } from '../config/jwt.config';
import AdminModel from '../models/account.models/admin.model';

const isProd = process.env.NODE_ENV === 'production';

const setAdminRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('adminRefreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAdminRefreshTokenCookie = (res: Response) => {
  res.clearCookie('adminRefreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  });
};

// ── AUTH ──────────────────────────────────────────────────

export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userName, password } = req.body;
    if (!userName?.trim() || !password) {
      res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' }); return;
    }

    const { refreshToken, ...result } = await adminService.login({ userName: userName.trim(), password });
    
    setAdminRefreshTokenCookie(res, refreshToken);
    
    res.json(result);
  } catch (err) { next(err); }
};

export const postLogout = (_req: Request, res: Response): void => {
  clearAdminRefreshTokenCookie(res);
  res.json({ message: 'Đăng xuất thành công' });
};

export const postRefresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token không tồn tại' });
      return;
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken, 'admin');
    } catch (err) {
      clearAdminRefreshTokenCookie(res);
      res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
      return;
    }

    const adminId = decoded.sub?.adminId;
    if (!adminId) {
      clearAdminRefreshTokenCookie(res);
      res.status(401).json({ message: 'Token payload không hợp lệ' });
      return;
    }

    const admin = await AdminModel.findById(adminId).lean();
    if (!admin) {
      clearAdminRefreshTokenCookie(res);
      res.status(401).json({ message: 'Tài khoản không tồn tại' });
      return;
    }

    const newToken = signAdminToken(adminId);
    res.json({ token: newToken });
  } catch (err) { next(err); }
};

// ── ADMIN PROFILE ─────────────────────────────────────────

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await adminService.getAdminProfile(getAdminId(req));
    res.json({ admin });
  } catch (err) { next(err); }
};

export const updateAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, phone, fb, address, avatar } = req.body;

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

    const admin = await adminService.updateAdminProfile(getAdminId(req), update);
    res.json({ message: 'Cập nhật thành công', admin });
  } catch (err) { next(err); }
};

export const changeAdminPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' }); return;
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({ message: 'Mật khẩu mới phải từ 6 đến 128 ký tự' }); return;
    }

    await adminService.changeAdminPassword(getAdminId(req), { currentPassword, newPassword });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) { next(err); }
};

// ── STUDENT MANAGEMENT ────────────────────────────────────

export const adminGetStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await studentService.adminGetStudents(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminGetStudentDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const result = await studentService.adminGetStudentDetail(id);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminCreateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, phone, courseIds, sendEmail } = req.body;
    if (!fullName?.trim() || !email?.trim()) {
      res.status(400).json({ message: 'Vui lòng nhập họ tên và email' }); return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' }); return;
    }
    if (fullName.trim().length > 100) {
      res.status(400).json({ message: 'Họ tên quá dài' }); return;
    }

    const validCourseIds = (courseIds || []).filter((id: string) => isValidId(id));
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    const result = await studentService.adminCreateStudent(
      { fullName: sanitizeStr(fullName, 100), email: email.toLowerCase().trim(), phone: sanitizeStr(phone || '', 20), validCourseIds, sendEmail },
      frontendUrl,
      isProd
    );

    res.status(201).json({
      message: 'Tạo tài khoản thành công' + (sendEmail !== false ? ' và đã gửi email' : ''),
      ...result
    });
  } catch (err) { next(err); }
};

export const adminUpdateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { fullName, phone, bio, avatar, isVerified } = req.body;
    if (avatar !== undefined && !isValidAvatarUrl(avatar)) {
      res.status(400).json({ message: 'URL ảnh đại diện không hợp lệ' }); return;
    }

    const update: Record<string, unknown> = {};
    if (fullName?.trim())        update.fullName   = sanitizeStr(fullName, 100);
    if (phone !== undefined)     update.phone      = sanitizeStr(phone, 20);
    if (bio !== undefined)       update.bio        = sanitizeStr(bio, 500);
    if (avatar !== undefined)    update.avatar     = sanitizeStr(avatar, 500);
    if (isVerified !== undefined) update.isVerified = Boolean(isVerified);

    const student = await studentService.adminUpdateStudent(id, update);
    res.json({ message: 'Cập nhật thành công', student });
  } catch (err) { next(err); }
};

export const adminResetStudentPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { newPassword, sendEmail } = req.body;
    if (newPassword && (newPassword.length < 6 || newPassword.length > 128)) {
      res.status(400).json({ message: 'Mật khẩu phải từ 6 đến 128 ký tự' }); return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const result = await studentService.adminResetStudentPassword(id, { newPassword, sendEmail }, frontendUrl, isProd);

    res.json({
      message: 'Đặt lại mật khẩu thành công',
      ...result
    });
  } catch (err) { next(err); }
};

export const adminGrantCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { courseIds } = req.body;
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 khóa học' }); return;
    }

    const validIds = courseIds.filter(cid => isValidId(cid));
    if (validIds.length === 0) {
      res.status(400).json({ message: 'Không có courseId hợp lệ' }); return;
    }

    const student = await studentService.adminGrantCourses(id, validIds);
    res.json({ message: `Đã cấp ${validIds.length} khóa học`, student });
  } catch (err) { next(err); }
};

export const adminRevokeCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const courseId = getParam(req.params.courseId);
    if (!isValidId(id) || !isValidId(courseId)) {
      res.status(400).json({ message: 'ID không hợp lệ' }); return;
    }

    const student = await studentService.adminRevokeCourse(id, courseId);
    res.json({ message: 'Đã thu hồi khóa học', student });
  } catch (err) { next(err); }
};

export const adminDeleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    await studentService.adminDeleteStudent(id);
    res.json({ message: 'Đã xóa học viên' });
  } catch (err) { next(err); }
};
