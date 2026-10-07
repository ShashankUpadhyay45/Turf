import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || req.body.userId || 'user-1';
    const result = await bookingService.createBooking(req.body, userId);
    sendSuccess(res, result, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await bookingService.getBookingById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    sendSuccess(res, result, 'Booking retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req.query.userId as string) || 'user-1';
    const result = await bookingService.getUserBookings(userId);
    sendSuccess(res, result, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTurfBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query;
    const result = await bookingService.getTurfBookings(turfId, date as string);
    sendSuccess(res, result, 'Turf bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;
    const result = await bookingService.cancelBooking(id, userId, reason);
    sendSuccess(res, result, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const rebook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime } = req.body;
    const result = await bookingService.rebook(id, newDate, newStartTime);
    sendSuccess(res, result, 'Booking rescheduled successfully');
  } catch (error) {
    next(error);
  }
};
