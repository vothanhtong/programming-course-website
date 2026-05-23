  import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { adminAuthentication } from '../middlewares/adminAuth.middleware';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import AdminModel from '../models/account.models/admin.model';
import StudentModel from '../models/student.model';
import logger from '../configs/logger';
import { getStudentId, getAdminId } from '../types';
import { isValidId } from '../utils/validators';

const router = Router();

// ── Thư mục lưu file ──────────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer config ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Tên file: timestamp + random hex + ext gốc (tránh trùng, tránh path traversal)
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  // Validate cả extension lẫn MIME type để tránh bypass
  if (allowed.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh: jpg, jpeg, png, webp, gif'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// ── POST /apis/upload/image ───────────────────────────────
// Chỉ admin mới được upload
router.post('/image', adminAuthentication, (req: Request, res: Response) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File quá lớn. Tối đa 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được gửi lên' });
    }

    // Trả về relative URL — frontend dùng proxy nên không cần domain
    const url = `/uploads/${req.file.filename}`;

    logger.info(`[upload] ${req.file.filename} (${req.file.size} bytes)`);
    return res.status(201).json({ url, filename: req.file.filename });
  });
});

// ── DELETE /apis/upload/image/:filename ──────────────────
// Xóa file khi không dùng nữa
router.delete('/image/:filename', adminAuthentication, (req: Request, res: Response) => {
  try {
    // Chặn path traversal
    const filename = path.basename(String(req.params.filename));
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'File không tồn tại' });
    }

    fs.unlinkSync(filepath);
    logger.info(`[upload] deleted ${filename}`);
    return res.json({ message: 'Đã xóa file' });
  } catch (err) {
    logger.error('[upload delete]', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

// ── POST /apis/upload/student-avatar ──────────────────────
// Student upload avatar
router.post('/student-avatar', studentAuthentication, (req: Request, res: Response) => {
  const studentId = getStudentId(req) as string | undefined;
  if (!studentId || !isValidId(studentId)) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  upload.single('avatar')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File quá lớn. Tối đa 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được gửi lên' });
    }

    try {
      // Cập nhật avatar path vào database
      const url = `/uploads/${req.file.filename}`;
      await StudentModel.updateOne(
        { _id: studentId },
        { avatar: url }
      );

      logger.info(`[student avatar] ${studentId} uploaded ${req.file.filename}`);
      return res.status(201).json({ url, message: 'Tải ảnh đại diện thành công' });
    } catch (err) {
      logger.error('[student avatar]', err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  });
});

// ── POST /apis/upload/admin-avatar ────────────────────────
// Admin upload avatar
router.post('/admin-avatar', adminAuthentication, (req: Request, res: Response) => {
  const adminId = getAdminId(req) as string | undefined;
  if (!adminId || !isValidId(adminId)) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  upload.single('avatar')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File quá lớn. Tối đa 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được gửi lên' });
    }

    try {
      // Cập nhật avatar path vào database
      const url = `/uploads/${req.file.filename}`;
      await AdminModel.updateOne(
        { _id: adminId },
        { avatar: url }
      );

      logger.info(`[admin avatar] ${adminId} uploaded ${req.file.filename}`);
      return res.status(201).json({ url, message: 'Tải ảnh đại diện thành công' });
    } catch (err) {
      logger.error('[admin avatar]', err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  });
});

export default router;
