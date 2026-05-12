import { Request } from 'express';

/** Extend Express Request với adminId sau khi xác thực */
export interface AdminRequest extends Request {
  adminId: string;
}

/** Extend Express Request với studentId sau khi xác thực */
export interface StudentRequest extends Request {
  studentId: string;
}

/** Helper lấy adminId từ request (đã được middleware set) */
export const getAdminId = (req: Request): string =>
  (req as AdminRequest).adminId;

/** Helper lấy studentId từ request (đã được middleware set) */
export const getStudentId = (req: Request): string =>
  (req as StudentRequest).studentId;

export type { CourseLevel, PaymentStatus, PaymentMethod } from '../utils/validators';
