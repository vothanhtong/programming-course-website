import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import { adminAuthentication } from '../middlewares/adminAuth.middleware';

const router = Router();

// ── STUDENT (require auth) ────────────────────────────
router.use(studentAuthentication);

// My Courses
router.get('/my-courses', progressController.getMyEnrolledCourses);

// Course progress
router.get('/course/:courseId', progressController.getCourseProgress);

// Update lesson progress
router.put('/course/:courseId/lesson/:lessonId', progressController.updateLessonProgress);

// Learning stats
router.get('/stats', progressController.getStudentLearningStats);

// ── ADMIN ────────────────────────────────────────────
// Admin lấy progress học viên trong khóa
router.get('/admin/course/:courseId', adminAuthentication, progressController.adminGetStudentProgress);

export default router;
