import { Request, Response, NextFunction } from 'express';
import * as turfService from '../services/turfService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getTurfs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, sport, area, minRating, maxPrice } = req.query;
    const result = await turfService.getTurfs(
      q, 
      sport as string, 
      area as string, 
      minRating ? Number(minRating) : undefined, 
      maxPrice ? Number(maxPrice) : undefined
    );
    sendSuccess(res, result, 'Turfs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTurfById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await turfService.getTurfById(id);
    sendSuccess(res, result, 'Turf retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTurf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await turfService.createTurf(req.body, req.user.id);
    sendSuccess(res, result, 'Turf created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTurf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await turfService.updateTurf(id, req.body, req.user.id);
    sendSuccess(res, result, 'Turf updated successfully');
  } catch (error) {
    next(error);
  }
};
