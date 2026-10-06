import { Router } from 'express';
import * as rewardController from '../controllers/rewardController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/ledger', protect, rewardController.getLedger);
router.post('/redeem', protect, rewardController.redeemVoucher);

export default router;
