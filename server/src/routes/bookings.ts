import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/my', bookingController.getUserBookings);
router.get('/turf/:turfId', bookingController.getTurfBookings);
router.get('/:id', bookingController.getBookingById);

router.post('/', bookingController.createBooking);
router.post('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/rebook', bookingController.rebook);

export default router;
