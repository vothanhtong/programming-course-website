import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AdminTokenPayload {
  sub: { adminId: string; role: string };
}

export const adminAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Không có token xác thực' });
      return;
    }

    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Lỗi cấu hình server' });
      return;
    }

    const decoded = jwt.verify(token, secret) as unknown as AdminTokenPayload;

    if (decoded?.sub?.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return;
    }

    (req as any).adminId = decoded.sub.adminId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
    } else {
      res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }
};
