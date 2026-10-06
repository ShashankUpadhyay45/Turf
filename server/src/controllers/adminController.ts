import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getPlatformStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = { users: 1500, turfs: 50, bookings: 12000, revenue: 500000 };
    sendSuccess(res, stats, 'Platform stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = [{ id: 'u1', name: 'John Doe', email: 'john@example.com' }];
    sendSuccess(res, users, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAllTurfs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const turfs = [{ id: 't1', name: 'Champions Arena', status: 'ACTIVE' }];
    sendSuccess(res, turfs, 'All turfs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getNotificationMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = { emailSent: 5000, whatsappSent: 4800, failed: 20, pending: 5 };
    sendSuccess(res, metrics, 'Notification metrics retrieved');
  } catch (error) {
    next(error);
  }
};
