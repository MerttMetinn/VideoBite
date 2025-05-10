import axios from 'axios';
import logger from './logger';
import config from '../config/config';
import { spawn } from 'child_process';
import path from 'path';

// YouTube transcript API için interface tanımlaması
interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

// YouTube video ID çıkarma
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// YouTube video detaylarını alma
export const getVideoDetails = async (videoId: string) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: config.youtubeApiKey
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const videoData = response.data.items[0];
      return {
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        duration: videoData.contentDetails.duration,
        publishedAt: videoData.snippet.publishedAt,
        channelTitle: videoData.snippet.channelTitle
      };
    }
    
    throw new Error('Video bulunamadı');
  } catch (error: any) {
    logger.error(`YouTube video detayları alınırken hata: ${error.message}`);
    throw new Error('Video detayları alınamadı: ' + error.message);
  }
};

// YouTube video transkript alma - Python script kullanarak
export const getYoutubeTranscript = async (videoId: string, language = 'tr') => {
  return new Promise<{ text: string, segments: TranscriptSegment[] }>((resolve, reject) => {
    try {
      const pythonScriptPath = path.join(__dirname, '../python/get_transcript.py');
      
      // Python process'i başlat
      const pythonProcess = spawn('python', [pythonScriptPath, videoId, language]);
      
      let scriptOutput = '';
      let scriptError = '';
      
      // Python çıktısını topla
      pythonProcess.stdout.on('data', (data) => {
        scriptOutput += data.toString();
      });
      
      // Python hata mesajlarını topla
      pythonProcess.stderr.on('data', (data) => {
        scriptError += data.toString();
      });
      
      // İşlem tamamlandığında
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Python transcript script error: ${scriptError}`);
          reject(new Error(`Python transcript script failed: ${scriptError}`));
          return;
        }
        
        try {
          const result = JSON.parse(scriptOutput);
          resolve({
            text: result.fullTranscript,
            segments: result.segments
          });
        } catch (err) {
          logger.error(`Python transcript output parse error: ${err}`);
          reject(new Error(`Failed to parse transcript output: ${err}`));
        }
      });
    } catch (error: any) {
      logger.error(`YouTube transkript alınırken hata: ${error.message}`);
      reject(new Error('Video transkripti alınamadı: ' + error.message));
    }
  });
};

// YouTube URL geçerliliğini kontrol et
export const isValidYoutubeUrl = (url: string): boolean => {
  const regExp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regExp.test(url);
}; 