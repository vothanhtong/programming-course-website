import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

router.post('/create-url', paymentController.createUrl);
router.post('/mock-ipn', paymentController.mockIpn);

export default router;
