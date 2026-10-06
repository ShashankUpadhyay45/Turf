import { Router } from 'express';
import * as slotController from '../controllers/slotController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', slotController.getSlots);
router.post('/hold', protect, slotController.holdSlot);
router.post('/block', protect, requireRole('owner', 'admin'), slotController.blockSlot);
router.post('/unblock', protect, requireRole('owner', 'admin'), slotController.unblockSlot);
router.post('/maintenance', protect, requireRole('owner', 'admin'), slotController.setMaintenance);
router.post('/maintenance/clear', protect, requireRole('owner', 'admin'), slotController.clearMaintenance);

export default router;
