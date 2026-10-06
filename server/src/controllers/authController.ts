import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getMe(req.user.id);
    sendSuccess(res, result, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.updatePreferences(req.user.id, req.body);
    sendSuccess(res, result, 'Preferences updated');
  } catch (error) {
    next(error);
  }
};
