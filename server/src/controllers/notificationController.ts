import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = [
      { id: 'n1', type: 'EMAIL', status: 'SENT', message: 'Booking confirmed' },
      { id: 'n2', type: 'WHATSAPP', status: 'SENT', message: 'Booking confirmed' }
    ];
    sendSuccess(res, logs, 'Notification logs retrieved');
  } catch (error) {
    next(error);
  }
};
