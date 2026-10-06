import { Router } from 'express';
import * as membershipController from '../controllers/membershipController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', membershipController.getPlans);
router.post('/subscribe', protect, membershipController.subscribe);

export default router;
