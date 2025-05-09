import { spawn } from 'child_process';
import path from 'path';
import logger from '../utils/logger';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  importantTerms: Record<string, string>;
}

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