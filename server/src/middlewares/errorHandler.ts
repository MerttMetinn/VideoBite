import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Hata türleri için interface
export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
  code?: number;
}

// Hata yakalama middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.name} - ${err.message}`);
  
  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Doğrulama hatası',
      errors: err.errors
    });
    return;
  }

  // Mongoose duplicate key hatası
  if (err.name === 'MongoError' && err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Bu veri zaten mevcut (duplicate key error)'
    });
    return;
  }

  // JWT hatası
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
    return;
  }

  // Token süresi dolmuş hatası
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token süresi dolmuş'
    });
    return;
  }

  // Özel durum kodu olan hatalar
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 404 Not Found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
}; 