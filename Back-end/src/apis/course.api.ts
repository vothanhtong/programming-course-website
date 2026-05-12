import { Router } from 'express';
import * as courseController from '../controllers/course.controller';

const router = Router();

router.get('/',         courseController.getCourseList);
router.get('/featured', courseController.getFeaturedCourses);
router.post('/enroll',  courseController.postEnroll);
router.post('/review',  courseController.postReview);
router.get('/:slug',    courseController.getCourseDetail); // đặt cuối

export default router;
