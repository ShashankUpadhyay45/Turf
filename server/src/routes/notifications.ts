import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/logs', protect, requireRole('admin', 'owner'), notificationController.getLogs);

export default router;
