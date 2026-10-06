import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Mock user attachment since no DB schema is provided
    req.user = decoded; 
    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', 401));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user?.role || 'unknown'} is not authorized to access this route`, 403));
    }
    next();
  };
};
