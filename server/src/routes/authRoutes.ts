import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Kullanıcı kaydı
router.post(
  '/register',
  [
    body('name').isString().notEmpty().withMessage('İsim alanı zorunludur'),
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
  ],
  authController.register
);

// Kullanıcı girişi
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password').notEmpty().withMessage('Şifre alanı zorunludur')
  ],
  authController.login
);

// Oturum doğrulama gerektiren rotalar
router.use(authenticate);

// Mevcut kullanıcı bilgilerini getir
router.get('/me', authController.getMe);

export default router; 