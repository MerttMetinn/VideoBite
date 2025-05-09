declare module 'youtube-transcript-api' {
  interface TranscriptSegment {
    text: string;
    duration: number;
    offset: number;
  }

  interface TranscriptOptions {
    lang?: string;
    country?: string;
  }

  export function getTranscript(videoId: string, options?: TranscriptOptions): Promise<TranscriptSegment[]>;
} 