import { Router } from 'express';
import { body } from 'express-validator';
import * as videoController from '../controllers/videoController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Video özeti oluştur
router.post(
  '/summary',
  [
    body('videoUrl').isString().withMessage('Video URL geçerli bir string olmalıdır')
      .notEmpty().withMessage('Video URL boş olamaz'),
    body('language').optional().isString().isLength({ min: 2, max: 5 }).withMessage('Geçerli bir dil kodu giriniz')
  ],
  videoController.createSummary
);

// Oturum açmayı gerektiren rotalar
router.use(authenticate);

// Kullanıcının kaydettiği özetleri getir
router.get('/my-summaries', videoController.getUserSummaries);

// Belirli bir özeti getir
router.get('/summary/:id', videoController.getSummaryById);

// Özeti sil
router.delete('/summary/:id', videoController.deleteSummary);

export default router; 