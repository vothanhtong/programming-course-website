import { Router } from 'express';
import { getCategoryList } from '../controllers/course.controller';

const router = Router();
router.get('/', getCategoryList);

export default router;
