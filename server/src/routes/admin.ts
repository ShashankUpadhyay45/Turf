import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getUsers);
router.get('/turfs', adminController.getAllTurfs);
router.get('/notifications/metrics', adminController.getNotificationMetrics);

export default router;
