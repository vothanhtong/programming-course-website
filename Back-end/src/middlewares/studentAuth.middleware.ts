import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface StudentTokenPayload {
  sub: { studentId: string; role: string };
}

export const studentAuthentication = (
  req: Request, res: Response, next: NextFunction
): void => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Vui lòng đăng nhập' });
      return;
    }

    const secret = process.env.JWT_STUDENT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Lỗi cấu hình server' });
      return;
    }

    const decoded = jwt.verify(token, secret) as unknown as StudentTokenPayload;
    if (decoded?.sub?.role !== 'student') {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return;
    }

    (req as any).studentId = decoded.sub.studentId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
    } else {
      res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }
};
