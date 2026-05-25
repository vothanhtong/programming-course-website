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
    { expiresIn: '15m' } // BUG-01 FIX: Access token ngắn hạn
  );
};

export const signAdminRefreshToken = (adminId: string): string => {
  const secret = process.env.JWT_ADMIN_REFRESH_SECRET || (process.env.JWT_ADMIN_SECRET + '_refresh');
  if (!secret) throw new Error('JWT_ADMIN_REFRESH_SECRET chưa được cấu hình');
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: { adminId, role: 'admin' } },
    secret,
    { expiresIn: '7d' } // Refresh token dài hạn
  );
};

// ── Student token ─────────────────────────────────────────
export const signStudentToken = (studentId: string): string => {
  const secret = process.env.JWT_STUDENT_SECRET;
  if (!secret) throw new Error('JWT_STUDENT_SECRET chưa được cấu hình');
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: { studentId, role: 'student' } },
    secret,
    { expiresIn: '15m' } // BUG-01 FIX: Access token ngắn hạn
  );
};

export const signStudentRefreshToken = (studentId: string): string => {
  const secret = process.env.JWT_STUDENT_REFRESH_SECRET || (process.env.JWT_STUDENT_SECRET + '_refresh');
  if (!secret) throw new Error('JWT_STUDENT_REFRESH_SECRET chưa được cấu hình');
  return jwt.sign(
    { iss: process.env.JWT_ISS || 'highsky', sub: { studentId, role: 'student' } },
    secret,
    { expiresIn: '7d' } // Refresh token dài hạn
  );
};

// ── Verify Refresh Token ──────────────────────────────────
export const verifyRefreshToken = (token: string, type: 'student' | 'admin'): any => {
  let secret = '';
  if (type === 'student') {
    secret = process.env.JWT_STUDENT_REFRESH_SECRET || (process.env.JWT_STUDENT_SECRET + '_refresh');
  } else {
    secret = process.env.JWT_ADMIN_REFRESH_SECRET || (process.env.JWT_ADMIN_SECRET + '_refresh');
  }
  return jwt.verify(token, secret);
};
