import axios from 'axios';
import { 
  VideoSummaryResponse, 
  UserSummariesResponse, 
  SummaryDetailResponse,
  AuthResponse,
  UserResponse
} from '../utils/types';

// API URL'yi doğrudan ayarla
const API_URL = 'http://localhost:5000/api';

// API istemcisini oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // CORS ayarlarını düzelt
});

// İstek interceptor - auth token'ını ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Videolarla ilgili API istekleri
export const videoApi = {
  // Video özeti oluştur
  createSummary: async (videoUrl: string, language = 'tr'): Promise<VideoSummaryResponse> => {
    try {
      const response = await apiClient.post<VideoSummaryResponse>('/videos/summary', { videoUrl, language });
      return response.data;
    } catch (error) {
      console.error('Video özeti oluşturma hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcının özetlerini getir
  getUserSummaries: async (): Promise<UserSummariesResponse> => {
    try {
      const response = await apiClient.get<UserSummariesResponse>('/videos/my-summaries');
      return response.data;
    } catch (error) {
      console.error('Kullanıcı özetleri alma hatası:', error);
      throw error;
    }
  },
  
  // Özet detayını getir
  getSummaryById: async (id: string): Promise<SummaryDetailResponse> => {
    try {
      const response = await apiClient.get<SummaryDetailResponse>(`/videos/summary/${id}`);
      return response.data;
    } catch (error) {
      console.error('Özet detayı alma hatası:', error);
      throw error;
    }
  },
  
  // Özet sil
  deleteSummary: async (id: string) => {
    try {
      const response = await apiClient.delete(`/videos/summary/${id}`);
      return response.data;
    } catch (error) {
      console.error('Özet silme hatası:', error);
      throw error;
    }
  }
};

// Kullanıcı kimlik doğrulama API istekleri
export const authApi = {
  // Kullanıcı kaydı
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      console.error('Kullanıcı kaydı hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı girişi
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      
      // Token'ı localStorage'a kaydet
      if (response.data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },
  
  // Çıkış yap
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  // Kullanıcı bilgilerini getir
  getMe: async (): Promise<UserResponse> => {
    try {
      const response = await apiClient.get<UserResponse>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Kullanıcı bilgisi alma hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcının oturum açıp açmadığını kontrol et
  isAuthenticated: (): boolean => {
    return typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  }
};

export default {
  videoApi,
  authApi
}; 