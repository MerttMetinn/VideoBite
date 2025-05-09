import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import VideoSummary, { IVideoSummary } from '../models/VideoSummary';
import logger from '../utils/logger';
import { 
  extractVideoId, 
  getVideoDetails, 
  isValidYoutubeUrl 
} from '../utils/youtubeHelper';
import summarizationService from '../services/summarizationService';

// Video özeti oluştur
export const createSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validasyon kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { videoUrl, language = 'tr' } = req.body;

    // URL kontrolü
    if (!isValidYoutubeUrl(videoUrl)) {
      return res.status(400).json({ message: 'Geçersiz YouTube URL formatı' });
    }

    // Video ID çıkar
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID bulunamadı' });
    }

    // Video detaylarını al
    const videoDetails = await getVideoDetails(videoId);
    
    // Python servisi ile özet oluştur
    const summaryData = await summarizationService.summarizeVideo(
      videoUrl,
      language,
      videoDetails.title
    );
    
    // Özeti veritabanına kaydet (kullanıcı girişi varsa)
    let savedSummary = null;
    if (req.user) {
      const videoSummary = new VideoSummary({
        userId: req.user.id,
        videoUrl,
        videoId,
        title: videoDetails.title,
        transcript: '',  // Python servisi transkripti döndürmüyor, ihtiyaç halinde eklenebilir
        summary: summaryData.summary,
        keyPoints: summaryData.keyPoints,
        language,
        duration: 0, // Süresi hesaplanabilir
      });

      savedSummary = await videoSummary.save();
    }

    // Yanıt
    res.status(200).json({
      success: true,
      data: {
        videoId,
        title: videoDetails.title,
        channelTitle: videoDetails.channelTitle,
        summary: summaryData.summary,
        keyPoints: summaryData.keyPoints,
        importantTerms: summaryData.importantTerms,
        summaryId: savedSummary ? savedSummary._id : null
      }
    });
  } catch (error: any) {
    logger.error(`Video özeti oluşturulurken hata: ${error.message}`);
    next(error);
  }
};

// Kullanıcının özetlerini getir
export const getUserSummaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    const summaries = await VideoSummary.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    logger.error(`Kullanıcı özetleri alınırken hata: ${error}`);
    next(error);
  }
};

// Özet detayını getir
export const getSummaryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await VideoSummary.findById(req.params.id);

    if (!summary) {
      return res.status(404).json({ message: 'Özet bulunamadı' });
    }

    // Yetkilendirme kontrolü - kullanıcının kendi özeti mi?
    if (req.user && summary.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor' });
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
export const deleteSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    const summary = await VideoSummary.findById(req.params.id);

    if (!summary) {
      return res.status(404).json({ message: 'Özet bulunamadı' });
    }

    // Yetkilendirme kontrolü - kullanıcının kendi özeti mi?
    if (summary.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor' });
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