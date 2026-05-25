import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều yêu cầu. Thử lại sau 15 phút.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

// Rate limiter riêng cho reset-password — brute-force token nguy hiểm hơn
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { message: 'Quá nhiều lần thử. Thử lại sau 15 phút.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
  skipSuccessfulRequests: false, // đếm cả request thành công
});

// Public
router.post('/register',        authLimiter,           validate(registerSchema),       authController.register);
router.post('/login',           authLimiter,           validate(loginSchema),          authController.login);
router.post('/logout',          authController.logout);
router.post('/refresh',         authController.refresh);
router.post('/forgot-password', authLimiter,           validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password',  resetPasswordLimiter,  validate(resetPasswordSchema),  authController.resetPassword);

// Protected
router.get ('/me',              studentAuthentication, authController.getMe);
router.put ('/profile',         studentAuthentication, authController.updateProfile);
router.put ('/change-password', studentAuthentication, authController.changePassword);

export default router;
