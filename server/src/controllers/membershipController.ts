import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = [
      { id: 'p1', name: 'Pro Player', price: 999, benefits: ['10% Off', 'Free Water'] },
      { id: 'p2', name: 'Elite', price: 1999, benefits: ['20% Off', 'Free Water', 'Locker'] }
    ];
    sendSuccess(res, plans, 'Membership plans retrieved');
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;
    sendSuccess(res, { userId: req.user.id, tier, status: 'ACTIVE' }, 'Subscribed successfully');
  } catch (error) {
    next(error);
  }
};
