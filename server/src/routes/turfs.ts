import { Router } from 'express';
import * as turfController from '../controllers/turfController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', turfController.getTurfs);
router.get('/search', turfController.searchTurfs);
router.get('/nearby', turfController.getNearbyTurfs);
router.get('/my', protect, requireRole('admin', 'owner'), turfController.getMyTurfs);
router.get('/:id/check-slot', turfController.checkSlot);
router.get('/:id', turfController.getTurfById);

router.post('/', protect, requireRole('admin', 'owner'), turfController.createTurf);
router.put('/:id', protect, requireRole('admin', 'owner'), turfController.updateTurf);

export default router;
