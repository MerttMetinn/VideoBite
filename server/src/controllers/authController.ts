import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import config from '../config/config';
import logger from '../utils/logger';
import { UserRole } from '../middlewares/auth';

// Token oluştur
const generateToken = (user: IUser) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role || UserRole.USER 
    }, 
    config.jwtSecret, 
    { expiresIn: '7d' }
  );
};

// Kullanıcı kaydı
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validasyon hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      return;
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // JWT token oluştur
    const token = generateToken(user);

    // Başarılı yanıt
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`Kayıt işlemi sırasında hata: ${error}`);
    next(error);
  }
};

// Kullanıcı girişi
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validasyon hataları
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Kullanıcı kontrolü
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
      return;
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
      return;
    }

    // JWT token oluştur
    const token = generateToken(user);

    // Başarılı yanıt
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`Giriş işlemi sırasında hata: ${error}`);
    next(error);
  }
};

// Mevcut kullanıcı bilgilerini getir
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme hatası' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`Kullanıcı bilgisi alınırken hata: ${error}`);
    next(error);
  }
}; 