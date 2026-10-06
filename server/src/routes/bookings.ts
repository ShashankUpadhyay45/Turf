import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, bookingController.createBooking);
router.get('/', protect, bookingController.getUserBookings);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

export default router;
