import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều yêu cầu. Thử lại sau 15 phút.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

// Public
router.post('/register',        authLimiter, authController.register);
router.post('/login',           authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password',              authController.resetPassword);

// Protected
router.get ('/me',              studentAuthentication, authController.getMe);
router.put ('/profile',         studentAuthentication, authController.updateProfile);
router.put ('/change-password', studentAuthentication, authController.changePassword);

export default router;
