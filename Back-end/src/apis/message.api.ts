import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { adminAuthentication } from '../middlewares/adminAuth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limit: tối đa 5 tin nhắn / 10 phút / IP
const msgLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  message: { message: 'Bạn gửi quá nhiều tin nhắn. Vui lòng thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

// Public
router.post('/', msgLimiter, messageController.postMessage);

export default router;
