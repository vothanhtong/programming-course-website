import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limit: tối đa 5 tin nhắn / 10 phút / IP
const msgLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  message: { message: 'Bạn gửi quá nhiều tin nhắn. Vui lòng thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

// Public — gửi tin nhắn liên hệ
router.post('/', msgLimiter, messageController.postMessage);

// Protected — chỉ student đã đăng nhập mới xem được chat history của chính mình
router.get('/by-email', studentAuthentication, messageController.getMessagesByEmail);

export default router;
