// 'youtube-transcript-api' için tip tanımlaması
declare module 'youtube-transcript-api' {
  interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
  }

  export function getTranscript(videoId: string, options?: any): Promise<TranscriptResponse[]>;
  export function getLanguages(videoId: string): Promise<{ [key: string]: string }[]>;
} 