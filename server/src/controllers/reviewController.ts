import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Turf } from '../models/Turf';
import { sendSuccess } from '../utils/apiResponse';

export const getTurfReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { turfId } = req.params;
    const reviews = await Review.find({ turfId }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, reviews, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { turfId, rating, comment, sports, userName, userId, userAvatar } = req.body;
    const reviewerId = (req as any).user?.id || userId || 'user-1';
    const reviewerName = userName || (req as any).user?.name || 'Playo Player';

    const review = await Review.create({
      turfId,
      userId: reviewerId,
      userName: reviewerName,
      userAvatar,
      rating: Number(rating),
      comment,
      sports: sports || ['football'],
      verifiedBooking: true,
      helpfulCount: 0,
    });

    // Recalculate average rating & reviewsCount for the turf
    const allReviews = await Review.find({ turfId });
    const count = allReviews.length;
    const avgRating = Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;

    await Turf.findOneAndUpdate(
      { $or: [{ customId: turfId }, { _id: turfId.match(/^[0-9a-fA-F]{24}$/) ? turfId : null }] },
      { $set: { rating: avgRating, reviewsCount: count } }
    );

    sendSuccess(res, review, 'Review added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    sendSuccess(res, review, 'Marked as helpful');
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { ownerReply: { comment, repliedAt: new Date() } } },
      { new: true }
    );
    sendSuccess(res, review, 'Reply submitted');
  } catch (error) {
    next(error);
  }
};
