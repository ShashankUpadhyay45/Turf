import { Request, Response, NextFunction } from 'express';
import * as availabilityService from '../services/availabilityService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { turfId, date } = req.query;
    const result = await availabilityService.getSlots(turfId as string, date as string);
    sendSuccess(res, result, 'Slots retrieved');
  } catch (error) {
    next(error);
  }
};

export const holdSlot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { turfId, date, startTime } = req.body;
    const result = await availabilityService.holdSlot(turfId, date, startTime, req.user.id);
    sendSuccess(res, result, 'Slot held successfully');
  } catch (error) {
    next(error);
  }
};

export const blockSlot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { turfId, date, startTime } = req.body;
    const result = await availabilityService.blockSlot(turfId, date, startTime, req.user.id);
    sendSuccess(res, result, 'Slot blocked successfully');
  } catch (error) {
    next(error);
  }
};

export const unblockSlot = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { turfId, date, startTime } = req.body;
    const result = await availabilityService.unblockSlot(turfId, date, startTime, req.user.id);
    sendSuccess(res, result, 'Slot unblocked successfully');
  } catch (error) {
    next(error);
  }
};

export const setMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { turfId, date, startTime } = req.body;
    const result = await availabilityService.setMaintenance(turfId, date, startTime, req.user.id);
    sendSuccess(res, result, 'Slot set to maintenance');
  } catch (error) {
    next(error);
  }
};

export const clearMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { turfId, date, startTime } = req.body;
    const result = await availabilityService.clearMaintenance(turfId, date, startTime, req.user.id);
    sendSuccess(res, result, 'Slot maintenance cleared');
  } catch (error) {
    next(error);
  }
};
