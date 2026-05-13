import { Router } from 'express';
import * as courseController from '../controllers/course.controller';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';

const router = Router();

// Middleware optional auth — gắn studentId nếu có token, không bắt buộc
const optionalAuth = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return next(); // không có token → bỏ qua
  studentAuthentication(req, res, (err?: any) => {
    // Dù lỗi hay không cũng next — auth là optional
    next();
  });
};

router.get('/',         courseController.getCourseList);
router.get('/featured', courseController.getFeaturedCourses);
router.post('/enroll',  optionalAuth, courseController.postEnroll);
router.post('/review',  courseController.postReview);
router.get('/:slug',    courseController.getCourseDetail); // đặt cuối

export default router;
