import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import logger from '../utils/logger';

// Kullanıcı rollerini tanımla
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Request nesnesini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

// Token doğrulama middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Bearer token al
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
  }

  try {
    // Token doğrula
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: UserRole };
    
    // Request'e kullanıcı bilgisi ekle
    req.user = {
      id: decoded.id,
      role: decoded.role || UserRole.USER
    };
    
    next();
  } catch (error) {
    logger.error(`Token doğrulama hatası: ${error}`);
    return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};

// Admin yetkisi kontrolü
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Yetkilendirme hatası: Kullanıcı bulunamadı' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Erişim engellendi: Admin yetkisi gerekli' });
  }

  next();
}; 