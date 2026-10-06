import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getLedger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ledger = [
      { id: 'l1', points: 100, type: 'EARNED', description: 'Booking Reward' },
      { id: 'l2', points: -50, type: 'REDEEMED', description: 'Booking Discount' }
    ];
    sendSuccess(res, ledger, 'Reward ledger retrieved');
  } catch (error) {
    next(error);
  }
};

export const redeemVoucher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { voucherCode } = req.body;
    sendSuccess(res, { userId: req.user.id, voucherCode, pointsAdded: 50 }, 'Voucher redeemed successfully');
  } catch (error) {
    next(error);
  }
};
