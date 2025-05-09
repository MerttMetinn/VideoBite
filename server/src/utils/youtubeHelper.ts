import axios from 'axios';
import { getTranscript } from 'youtube-transcript-api';
import logger from './logger';
import config from '../config/config';

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

// YouTube video transkript alma
export const getYoutubeTranscript = async (videoId: string, language = 'tr') => {
  try {
    const transcript = await getTranscript(videoId, {
      lang: language
    });

    if (!transcript || transcript.length === 0) {
      throw new Error('Transkript bulunamadı');
    }

    // Transkripti birleştir
    const fullTranscript = transcript
      .map((item: TranscriptSegment) => item.text)
      .join(' ');
    
    return {
      text: fullTranscript,
      segments: transcript
    };
  } catch (error: any) {
    logger.error(`YouTube transkript alınırken hata: ${error.message}`);
    throw new Error('Video transkripti alınamadı: ' + error.message);
  }
};

// YouTube URL geçerliliğini kontrol et
export const isValidYoutubeUrl = (url: string): boolean => {
  const regExp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regExp.test(url);
}; 