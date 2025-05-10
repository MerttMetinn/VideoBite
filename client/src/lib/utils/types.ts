// API yanıt tipleri

// Video özeti yanıt tipi
export interface VideoSummaryResponse {
  success: boolean;
  data: {
    videoId: string;
    title: string;
    channelTitle: string;
    summary: string;
    keyPoints: string[];
    importantTerms: string[];
    summaryId: string | null;
  };
}

// Video verisi tanımı
export interface SummaryData {
  _id?: string;
  videoId: string;
  title: string;
  channelTitle?: string;
  summary: string;
  keyPoints: string[];
  importantTerms?: string[] | Record<string, string>;
  transcript?: string;
  summaryId?: string;
}

// API yanıt türü
export interface ApiResponse {
  success: boolean;
  summary?: SummaryData;
  data?: SummaryData;
}

// Kullanıcı özet listesi yanıt tipi
export interface UserSummariesResponse {
  success: boolean;
  count: number;
  data: {
    _id: string;
    userId: string;
    videoUrl: string;
    videoId: string;
    title: string;
    summary: string;
    keyPoints: string[];
    language: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

// Özet detayı yanıt tipi
export interface SummaryDetailResponse {
  success: boolean;
  data: {
    _id: string;
    userId: string;
    videoUrl: string;
    videoId: string;
    title: string;
    transcript: string;
    summary: string;
    keyPoints: string[];
    language: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Auth yanıt tipleri
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
} 