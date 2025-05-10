import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import VideoSummary, { IVideoSummary } from '../models/VideoSummary';
import logger from '../utils/logger';
import { 
  extractVideoId, 
  getVideoDetails, 
  isValidYoutubeUrl 
} from '../utils/youtubeHelper';
import { generateVideoSummary } from '../services/summarizationService';
import mongoose from 'mongoose';

/**
 * Bir YouTube videosu için özet oluşturur
 * @route POST /api/videos/summary
 */
export const createSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { videoUrl, language = 'tr' } = req.body;
    logger.info(`Video özeti oluşturuluyor: ${videoUrl}`);

    // Video ID'sini al
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      res.status(400).json({ message: 'Geçersiz YouTube URL\'si' });
      return;
    }

    // Daha önce özet oluşturulmuş mu diye kontrol et
    let savedSummary = await VideoSummary.findOne({ videoId });

    if (savedSummary) {
      logger.info(`Var olan özet kullanılıyor: ${videoId}`);
      res.status(200).json({
        success: true,
        summary: savedSummary
      });
      return;
    }

    // Video detaylarını al
    const videoDetails = await getVideoDetails(videoId);
    if (!videoDetails) {
      res.status(404).json({ message: 'Video detayları alınamadı' });
      return;
    }

    // Python betiğini kullanarak özet oluştur
    const summaryData = await generateVideoSummary(videoUrl, language);
    logger.info(`Video özeti başarıyla oluşturuldu: ${videoUrl}`);

    // Özet nesnesini oluştur
    const videoSummary = new VideoSummary({
      userId: req.user ? req.user.id : new mongoose.Types.ObjectId(), // Kullanıcı yoksa geçici ID
      videoUrl,
      videoId,
      title: videoDetails.title,
      transcript: summaryData.transcriptExcerpt || 'Bu video için transkript mevcut değil.',
      summary: summaryData.summary,
      keyPoints: summaryData.keyPoints,
      language,
      duration: 0, // Süresi hesaplanabilir
    });

    try {
      // Özeti kaydet
      savedSummary = await videoSummary.save();
      logger.info(`Özet veritabanına kaydedildi: ${videoId}`);
    } catch (saveError) {
      logger.error(`Özet kaydedilirken hata: ${saveError}`);
      // Kaydetme hatası olsa bile özeti döndür
    }

    // Başarılı yanıt döndür
    res.status(200).json({
      success: true,
      summary: {
        _id: savedSummary ? savedSummary._id : null,
        videoId,
        title: videoDetails.title,
        channelTitle: videoDetails.channelTitle || '',
        summary: summaryData.summary,
        keyPoints: summaryData.keyPoints,
        importantTerms: summaryData.importantTerms || {},
        transcript: summaryData.transcriptExcerpt || '',
      }
    });
  } catch (error: any) {
    logger.error(`Video özeti oluşturulurken hata: ${error.message}`);
    next(error);
  }
};

/**
 * Bir kullanıcının kaydettiği video özetlerini getirir
 * @route GET /api/videos/my-summaries
 */
export const getUserSummaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme hatası' });
      return;
    }

    const summaries = await VideoSummary.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: summaries.length,
      summaries
    });
  } catch (error: any) {
    logger.error(`Kullanıcı özetleri alınırken hata: ${error.message}`);
    next(error);
  }
};

// Özet detayını getir
export const getSummaryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await VideoSummary.findById(req.params.id);

    if (!summary) {
      res.status(404).json({ message: 'Özet bulunamadı' });
      return;
    }

    // Yetkilendirme kontrolü - kullanıcının kendi özeti mi?
    if (req.user && summary.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor' });
      return;
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error(`Özet detayı alınırken hata: ${error}`);
    next(error);
  }
};

// Özeti sil
export const deleteSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme hatası' });
      return;
    }

    const summary = await VideoSummary.findById(req.params.id);

    if (!summary) {
      res.status(404).json({ message: 'Özet bulunamadı' });
      return;
    }

    // Yetkilendirme kontrolü - kullanıcının kendi özeti mi?
    if (summary.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor' });
      return;
    }

    await VideoSummary.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Özet başarıyla silindi'
    });
  } catch (error) {
    logger.error(`Özet silinirken hata: ${error}`);
    next(error);
  }
};

/**
 * Bir videoyu favorilere ekler
 * @route POST /api/videos/favorite/:id
 */
export const addToFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme hatası' });
      return;
    }

    const videoSummary = await VideoSummary.findById(req.params.id);
    if (!videoSummary) {
      res.status(404).json({ message: 'Video özeti bulunamadı' });
      return;
    }

    if (videoSummary.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      return;
    }

    videoSummary.isFavorite = !videoSummary.isFavorite;
    await videoSummary.save();

    res.status(200).json({
      success: true,
      isFavorite: videoSummary.isFavorite,
      message: videoSummary.isFavorite ? 'Video favorilere eklendi' : 'Video favorilerden çıkarıldı'
    });
  } catch (error: any) {
    logger.error(`Favori işlemi sırasında hata: ${error.message}`);
    next(error);
  }
}; 