import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.' },
  standardHeaders: 'draft-7', legacyHeaders: false, skipSuccessfulRequests: true,
});

export const enrollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  message: { message: 'Quá nhiều yêu cầu đăng ký. Thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều tin nhắn. Vui lòng thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: 'draft-7', legacyHeaders: false,
});
