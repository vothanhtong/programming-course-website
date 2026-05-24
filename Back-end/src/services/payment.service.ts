import jwt from 'jsonwebtoken';
import EnrollmentModel from '../models/course.models/enrollment.model';
import CourseModel from '../models/course.models/course.model';
import StudentModel from '../models/student.model';
import { enrollmentService } from './enrollment.service';

const PAYMENT_SECRET = process.env.PAYMENT_SECRET || 'mock_payment_secret_2026';

export const paymentService = {
  async createPaymentUrl(enrollmentId: string, amount: number, courseId: string, frontendUrl: string) {
    const token = jwt.sign({ enrollmentId, amount, courseId }, PAYMENT_SECRET, { expiresIn: '1h' });
    const mockGatewayUrl = `${frontendUrl}/mock-payment?token=${token}`;
    return mockGatewayUrl;
  },

  async handleIpnWebhook(token: string, status: 'success' | 'failed') {
    let payload: any;
    try {
      payload = jwt.verify(token, PAYMENT_SECRET);
    } catch (e) {
      const err: any = new Error('Token thanh toán không hợp lệ hoặc đã hết hạn');
      err.status = 400;
      throw err;
    }

    if (status !== 'success') {
      // Just mark as failed or do nothing. In this mock, we can just return.
      return { success: false, message: 'Thanh toán thất bại' };
    }

    const { enrollmentId } = payload;
    
    // We can re-use the adminUpdateEnrollment logic since it handles exactly what we need
    // (marking as paid, updating student courses, caching, sending email).
    const enrollment = await enrollmentService.adminUpdateEnrollment(enrollmentId, 'paid');
    
    return { success: true, message: 'Thanh toán thành công', enrollment };
  }
};
