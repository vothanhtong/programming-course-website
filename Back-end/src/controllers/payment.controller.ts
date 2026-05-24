import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import EnrollmentModel from '../models/course.models/enrollment.model';
import { isValidId } from '../utils/validators';

export const createUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { enrollmentId } = req.body;
    if (!enrollmentId || !isValidId(enrollmentId)) {
      res.status(400).json({ message: 'enrollmentId không hợp lệ' }); return;
    }

    const enrollment = await EnrollmentModel.findById(enrollmentId).lean();
    if (!enrollment) {
      res.status(404).json({ message: 'Không tìm thấy đăng ký' }); return;
    }
    
    if (enrollment.paymentStatus === 'paid') {
      res.status(400).json({ message: 'Đơn hàng này đã được thanh toán' }); return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const paymentUrl = await paymentService.createPaymentUrl(enrollment._id.toString(), enrollment.amount, enrollment.courseId.toString(), frontendUrl);

    res.json({ paymentUrl });
  } catch (err) { next(err); }
};

export const mockIpn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, status } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Thiếu payment token' }); return;
    }

    const result = await paymentService.handleIpnWebhook(token, status || 'success');
    res.json(result);
  } catch (err) { next(err); }
};
