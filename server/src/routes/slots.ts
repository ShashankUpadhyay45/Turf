import { Router } from 'express';
import * as slotController from '../controllers/slotController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', slotController.getSlots);
router.post('/hold', slotController.holdSlot);
router.post('/release', slotController.releaseHold);

router.post('/block', protect, requireRole('admin', 'owner'), slotController.blockSlot);
router.post('/unblock', protect, requireRole('admin', 'owner'), slotController.unblockSlot);
router.post('/maintenance', protect, requireRole('admin', 'owner'), slotController.setMaintenance);
router.post('/clear-maintenance', protect, requireRole('admin', 'owner'), slotController.clearMaintenance);

export default router;
