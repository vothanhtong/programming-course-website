import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_TIME } from '../constants';

interface JwtPayload {
  [key: string]: unknown;
}

// ── Generic encoder (dùng nội bộ) ────────────────────────
export const encodedToken = (
  secretKey: string,
  payload: JwtPayload,
  expire: number = JWT_EXPIRES_TIME
): string => {
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: payload },
    secretKey,
    { expiresIn: expire }
  );
};

// ── Admin token ───────────────────────────────────────────
export const signAdminToken = (adminId: string): string => {
  const secret = process.env.JWT_ADMIN_SECRET;
  if (!secret) throw new Error('JWT_ADMIN_SECRET chưa được cấu hình');
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: { adminId, role: 'admin' } },
    secret,
    { expiresIn: JWT_EXPIRES_TIME }
  );
};

// ── Student token ─────────────────────────────────────────
export const signStudentToken = (studentId: string): string => {
  const secret = process.env.JWT_STUDENT_SECRET;
  if (!secret) throw new Error('JWT_STUDENT_SECRET chưa được cấu hình');
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: { studentId, role: 'student' } },
    secret,
    { expiresIn: '7d' }
  );
};
