import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  
  logger.error(err);

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err : undefined);
};
