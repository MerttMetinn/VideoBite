'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/lib/utils/types';

interface VideoSummaryFormProps {
  onSummaryCreated?: (data: ApiResponse) => void;
}

export default function VideoSummaryForm({ onSummaryCreated }: VideoSummaryFormProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Lütfen bir YouTube videosu URL\'si girin');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // API isteği yap - doğrudan axios kullanarak
      const response = await axios.post('http://localhost:5000/api/videos/summary', 
        { videoUrl, language: 'tr' },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false
        }
      );
      
      console.log('API yanıtı:', response);
      const data = response.data as ApiResponse;
      
      // Formu temizle
      setVideoUrl('');
      
      // Başarı bildirimi göster
      toast("Özet oluşturuldu!", {
        description: "Video özeti başarıyla oluşturuldu."
      });
      
      // Özet verilerini üst bileşene gönder
      if (onSummaryCreated && data) {
        onSummaryCreated(data);
      } else {
        console.error('Özet verileri alınamadı veya geçersiz:', data);
      }
    } catch (err: unknown) {
      // Hata mesajı oluştur
      let errorMessage = 'Video özeti oluşturulurken bir hata oluştu';
      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        console.error('Axios hatası detayları:', axiosError);
        
        if (axiosError.message && axiosError.message.includes('Network Error')) {
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.';
        } else if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
          const responseData = axiosError.response.data as { message?: string };
          if (responseData.message) {
            errorMessage = responseData.message;
          }
        }
      }
      
      setError(errorMessage);
      toast("Hata!", {
        description: errorMessage,
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">YouTube Linkini Girin</h2>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Özet Oluşturuluyor...
              </>
            ) : (
              'Özet Oluştur'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 