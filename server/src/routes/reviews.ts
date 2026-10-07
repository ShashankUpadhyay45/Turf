import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';

const router = Router();

router.get('/turf/:turfId', reviewController.getTurfReviews);
router.post('/', reviewController.addReview);
router.post('/:id/helpful', reviewController.markHelpful);
router.post('/:id/reply', reviewController.replyToReview);

export default router;
