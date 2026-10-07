import { Request, Response, NextFunction } from 'express';
import * as turfService from '../services/turfService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getTurfs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, sport, city, area, minRating, maxPrice, venueCategory, onlyAvailable } = req.query;
    const result = await turfService.getTurfs({
      q: q as string,
      sport: sport as string,
      city: city as string,
      area: area as string,
      minRating: minRating ? Number(minRating) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      venueCategory: venueCategory as string,
      onlyAvailable: onlyAvailable === 'true',
    });
    sendSuccess(res, result, 'Turfs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const searchTurfs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q || req.query.query || '') as string;
    const result = await turfService.getTurfs({ q: query });
    sendSuccess(res, result, 'Turfs search results');
  } catch (error) {
    next(error);
  }
};

export const getNearbyTurfs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }
    const result = await turfService.getNearbyTurfs(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : 25
    );
    sendSuccess(res, result, 'Nearby turfs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTurfById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await turfService.getTurfById(id);
    sendSuccess(res, result, 'Turf details retrieved');
  } catch (error) {
    next(error);
  }
};

export const checkSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, time } = req.query;
    const result = await turfService.checkSlotAvailability(id, date as string, time as string);
    sendSuccess(res, result, 'Slot availability check');
  } catch (error) {
    next(error);
  }
};

export const getMyTurfs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await turfService.getTurfsByOwner(req.user.id);
    sendSuccess(res, result, 'Owner turfs retrieved');
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
