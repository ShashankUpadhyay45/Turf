import { Router } from 'express';
import authRoutes from './auth';
import turfRoutes from './turfs';
import slotRoutes from './slots';
import bookingRoutes from './bookings';
import reviewRoutes from './reviews';
import tournamentRoutes from './tournaments';
import membershipRoutes from './memberships';
import rewardRoutes from './rewards';
import notificationRoutes from './notifications';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/turfs', turfRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/memberships', membershipRoutes);
router.use('/rewards', rewardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
