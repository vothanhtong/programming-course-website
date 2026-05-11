import { Router } from 'express';
import * as adminController  from '../controllers/admin.controller';
import * as courseController from '../controllers/course.controller';
import * as messageController from '../controllers/message.controller';
import { adminAuthentication } from '../middlewares/adminAuth.middleware';

const router = Router();

// ── Public ────────────────────────────────────────────────
router.post('/login', adminController.postLogin);

// ── Protected (require admin token) ──────────────────────
router.use(adminAuthentication);

router.post('/logout', adminController.postLogout);

// Admin profile
router.get ('/profile',          adminController.getAdminProfile);
router.put ('/profile',          adminController.updateAdminProfile);
router.put ('/change-password',  adminController.changeAdminPassword);

// Stats
router.get('/stats',                          courseController.adminGetStats);
router.get('/stats/enrollments-by-month',     courseController.adminGetEnrollmentsByMonth);

// Courses
router.get   ('/courses',        courseController.adminGetCourseList);
router.post  ('/courses',        courseController.adminAddCourse);
router.put   ('/courses/:id',    courseController.adminUpdateCourse);
router.delete('/courses/:id',    courseController.adminDeleteCourse);

// Lessons
router.get   ('/lessons',        courseController.adminGetLessons);
router.post  ('/lessons',        courseController.adminAddLesson);
router.put   ('/lessons/:id',    courseController.adminUpdateLesson);
router.delete('/lessons/:id',    courseController.adminDeleteLesson);

// Categories
router.get   ('/categories',        courseController.adminGetCategories);
router.post  ('/categories',        courseController.adminAddCategory);
router.delete('/categories/:id',    courseController.adminDeleteCategory);

// Enrollments
router.get('/enrollments',      courseController.adminGetEnrollments);
router.put('/enrollments/:id',  courseController.adminUpdateEnrollment);
router.delete('/enrollments/:id', courseController.adminDeleteEnrollment);

// Reviews
router.get   ('/reviews',               courseController.adminGetReviews);
router.put   ('/reviews/:id/approve',   courseController.adminApproveReview);
router.delete('/reviews/:id',           courseController.adminDeleteReview);

// ── Student management ────────────────────────────────────
router.get   ('/students',                          adminController.adminGetStudents);
router.post  ('/students',                          adminController.adminCreateStudent);
router.get   ('/students/:id',                      adminController.adminGetStudentDetail);
router.put   ('/students/:id',                      adminController.adminUpdateStudent);
router.delete('/students/:id',                      adminController.adminDeleteStudent);
router.put   ('/students/:id/reset-password',       adminController.adminResetStudentPassword);
router.post  ('/students/:id/grant-courses',        adminController.adminGrantCourses);
router.delete('/students/:id/courses/:courseId',    adminController.adminRevokeCourse);

// ── Messages ──────────────────────────────────────────────
router.get   ('/messages',              messageController.adminGetMessages);
router.get   ('/messages/unread-count', messageController.adminUnreadCount);
router.put   ('/messages/:id/read',     messageController.adminMarkRead);
router.delete('/messages/:id',          messageController.adminDeleteMessage);

export default router;
