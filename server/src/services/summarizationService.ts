import { spawn } from 'child_process';
import path from 'path';
import config from '../config/config';
import logger from '../utils/logger';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  importantTerms: Record<string, string>;
}

/**
 * Harici bir Python betiğini çalıştırarak YouTube videosu için özet oluşturur
 * @param videoUrl YouTube video URL'si
 * @param language Transkript dili (varsayılan: tr)
 * @returns Video özeti ve anahtar noktaları
 */
export const generateVideoSummary = (videoUrl: string, language: string = 'tr'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../python/video_summary.py');
    
    logger.info(`Python betiği çalıştırılıyor: ${pythonScriptPath}`);
    
    // Uygun ortama göre Python yorumlayıcısı seç
    const pythonExecutable = config.isProd ? 'python3' : 'python';
    
    // YouTube videosu için özet oluşturmak üzere Python betiğini çalıştır
    const pythonProcess = spawn(pythonExecutable, [
      pythonScriptPath,
      '--url', videoUrl,
      '--language', language,
    ]);
    
    let dataString = '';
    let errorString = '';
    
    // Standart çıktıdan gelen veriyi topla
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Hata çıktısını topla
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      logger.error(`Python betiği hata çıktısı: ${data.toString()}`);
    });
    
    // İşlem tamamlandığında
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Python işlemi başarısız oldu, çıkış kodu: ${code}`);
        logger.error(`Hata: ${errorString}`);
        return reject(new Error(`Python işlemi başarısız oldu: ${errorString}`));
      }
      
      try {
        // Python'dan dönen JSON veriyi ayrıştır
        const result = JSON.parse(dataString);
        logger.info('Video özeti başarıyla oluşturuldu');
        resolve(result);
      } catch (err) {
        logger.error(`JSON ayrıştırma hatası: ${err}`);
        logger.error(`Alınan veri: ${dataString}`);
        reject(new Error('Python betiğinden dönen veri ayrıştırılamadı'));
      }
    });
    
    // Beklenmeyen bir hata durumunda
    pythonProcess.on('error', (err) => {
      logger.error(`Python işlemi çalıştırılırken hata: ${err}`);
      reject(new Error(`Python işlemi çalıştırılırken hata: ${err.message}`));
    });
  });
};

/**
 * Bir YouTube kanalındaki videoları ve özetleri getirir
 * @param channelId YouTube kanal ID'si
 * @param maxVideos Maksimum video sayısı (varsayılan: 10)
 * @param language Transkript dili (varsayılan: tr)
 * @returns Kanal videoları ve özetleri
 */
export const getChannelVideoSummaries = (channelId: string, maxVideos: number = 10, language: string = 'tr'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../python/video_summary.py');
    
    logger.info(`Kanal videoları için Python betiği çalıştırılıyor: ${channelId}`);
    
    // Uygun ortama göre Python yorumlayıcısı seç
    const pythonExecutable = config.isProd ? 'python3' : 'python';
    
    // Kanal videolarını getirmek için Python betiğini çalıştır
    const pythonProcess = spawn(pythonExecutable, [
      pythonScriptPath,
      '--channel_id', channelId,
      '--max_videos', maxVideos.toString(),
      '--language', language,
    ]);
    
    let dataString = '';
    let errorString = '';
    
    // Standart çıktıdan gelen veriyi topla
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Hata çıktısını topla
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      logger.error(`Python betiği hata çıktısı: ${data.toString()}`);
    });
    
    // İşlem tamamlandığında
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Python işlemi başarısız oldu, çıkış kodu: ${code}`);
        logger.error(`Hata: ${errorString}`);
        return reject(new Error(`Python işlemi başarısız oldu: ${errorString}`));
      }
      
      try {
        // Python'dan dönen JSON veriyi ayrıştır
        const result = JSON.parse(dataString);
        logger.info(`Kanal için ${result.videos?.length || 0} video özeti başarıyla oluşturuldu`);
        resolve(result);
      } catch (err) {
        logger.error(`JSON ayrıştırma hatası: ${err}`);
        logger.error(`Alınan veri: ${dataString}`);
        reject(new Error('Python betiğinden dönen veri ayrıştırılamadı'));
      }
    });
    
    // Beklenmeyen bir hata durumunda
    pythonProcess.on('error', (err) => {
      logger.error(`Python işlemi çalıştırılırken hata: ${err}`);
      reject(new Error(`Python işlemi çalıştırılırken hata: ${err.message}`));
    });
  });
};

/**
 * Python betik yoluyla YouTube video özetleme servisi
 */
export class SummarizationService {
  private pythonScriptPath: string;

  constructor() {
    // Python betiğinin tam yolunu al
    this.pythonScriptPath = path.resolve(__dirname, '../python/video_summary.py');
  }

  /**
   * YouTube videosunu özetler
   * @param videoUrl YouTube video URL'si
   * @param language Transkript ve özet dili
   * @param videoTitle Video başlığı (opsiyonel)
   * @returns Özet sonucu
   */
  public async summarizeVideo(
    videoUrl: string,
    language: string = 'tr',
    videoTitle: string = ''
  ): Promise<SummaryResult> {
    return new Promise((resolve, reject) => {
      logger.info(`Video özeti oluşturuluyor: ${videoUrl}`);

      // Python betik çalıştırma komutunu hazırla
      const pythonProcess = spawn('python', [
        this.pythonScriptPath,
        '--url', videoUrl,
        '--language', language,
        '--title', videoTitle
      ]);

      let dataString = '';
      let errorString = '';

      // Standart çıktıdan gelen veriyi topla
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      // Hata çıktısını topla
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      // İşlem tamamlandığında
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Python betiği hata kodu ile sonlandı: ${code}`);
          logger.error(`Hata: ${errorString}`);
          return reject(new Error(`Video özeti oluşturulamadı. Hata kodu: ${code}`));
        }

        try {
          // JSON çıktıyı ayrıştır
          const result: SummaryResult = JSON.parse(dataString);
          logger.info(`Video özeti başarıyla oluşturuldu: ${videoUrl}`);
          resolve(result);
        } catch (error) {
          logger.error(`JSON ayrıştırma hatası: ${error}`);
          logger.error(`Alınan veri: ${dataString}`);
          reject(new Error('Özet verisi ayrıştırılamadı'));
        }
      });

      // Beklenmeyen hatalar
      pythonProcess.on('error', (error) => {
        logger.error(`Python betiği çalıştırılırken hata: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Video ID kullanarak YouTube videosunu özetler
   * @param videoId YouTube video ID'si
   * @param language Transkript ve özet dili
   * @param videoTitle Video başlığı (opsiyonel)
   * @returns Özet sonucu
   */
  public async summarizeVideoById(
    videoId: string,
    language: string = 'tr',
    videoTitle: string = ''
  ): Promise<SummaryResult> {
    return new Promise((resolve, reject) => {
      logger.info(`Video ID ile özet oluşturuluyor: ${videoId}`);

      // Python betik çalıştırma komutunu hazırla
      const pythonProcess = spawn('python', [
        this.pythonScriptPath,
        '--video_id', videoId,
        '--language', language,
        '--title', videoTitle
      ]);

      let dataString = '';
      let errorString = '';

      // Standart çıktıdan gelen veriyi topla
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      // Hata çıktısını topla
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      // İşlem tamamlandığında
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Python betiği hata kodu ile sonlandı: ${code}`);
          logger.error(`Hata: ${errorString}`);
          return reject(new Error(`Video özeti oluşturulamadı. Hata kodu: ${code}`));
        }

        try {
          // JSON çıktıyı ayrıştır
          const result: SummaryResult = JSON.parse(dataString);
          logger.info(`Video özeti başarıyla oluşturuldu: ${videoId}`);
          resolve(result);
        } catch (error) {
          logger.error(`JSON ayrıştırma hatası: ${error}`);
          logger.error(`Alınan veri: ${dataString}`);
          reject(new Error('Özet verisi ayrıştırılamadı'));
        }
      });

      // Beklenmeyen hatalar
      pythonProcess.on('error', (error) => {
        logger.error(`Python betiği çalıştırılırken hata: ${error.message}`);
        reject(error);
      });
    });
  }
}

// Servisin bir örneğini dışa aktar
export default new SummarizationService(); 