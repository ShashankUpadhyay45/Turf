import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.createBooking(req.body, req.user.id);
    sendSuccess(res, result, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.getUserBookings(req.user.id);
    sendSuccess(res, result, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await bookingService.cancelBooking(id, req.user.id);
    sendSuccess(res, result, 'Booking cancelled');
  } catch (error) {
    next(error);
  }
};
