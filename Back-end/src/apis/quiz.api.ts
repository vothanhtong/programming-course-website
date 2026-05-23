import { Router } from 'express';
import { adminAuthentication } from '../middlewares/adminAuth.middleware';
import { studentAuthentication } from '../middlewares/studentAuth.middleware';
import * as quizController from '../controllers/quiz.controller';

const router = Router();

// ==========================================
// ADMIN ROUTES (/apis/quizzes/admin)
// ==========================================
router.post('/admin', adminAuthentication, quizController.createQuiz);
router.get('/admin', adminAuthentication, quizController.getAdminQuizzes);
router.put('/admin/:id', adminAuthentication, quizController.updateQuiz);
router.delete('/admin/:id', adminAuthentication, quizController.deleteQuiz);

// ==========================================
// STUDENT ROUTES (/apis/quizzes)
// ==========================================
router.get('/course/:courseId', quizController.getCourseQuizzes);
router.get('/history', studentAuthentication, quizController.getStudentQuizHistory);
router.get('/:id', quizController.getQuizForStudent);
router.post('/:id/submit', studentAuthentication, quizController.submitQuiz);

export default router;
