import { Router } from 'express';
import courseApi from '../apis/course.api';
import categoryApi from '../apis/category.api';
import adminApi from '../apis/admin.api';
import authApi from '../apis/auth.api';
import uploadApi from '../apis/upload.api';
import messageApi from '../apis/message.api';
import progressApi from '../apis/progress.api';
import quizApi from '../apis/quiz.api';

const router = Router();

router.use('/auth', authApi);
router.use('/admin', adminApi);
router.use('/courses', courseApi);
router.use('/categories', categoryApi);
router.use('/upload', uploadApi);
router.use('/messages', messageApi);
router.use('/progress', progressApi);
router.use('/quizzes', quizApi);

export default router;
