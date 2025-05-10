'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { authApi } from '@/lib/api';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast("Hata!", {
        description: "Lütfen e-posta ve şifre alanlarını doldurun.",
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // API isteği yap
      await authApi.login(email, password);
      
      // Başarılı giriş mesajı göster
      toast("Giriş başarılı!", {
        description: "Hoş geldiniz, yönlendiriliyorsunuz..."
      });
      
      // Kullanıcıyı ana sayfaya yönlendir
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      // Hata mesajını göster
      const errorMessage = error.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
      toast("Hata!", {
        description: errorMessage,
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <Input 
              type="email" 
              placeholder="E-posta Adresi" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <Input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember" className="text-sm">Beni Hatırla</label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Şifremi Unuttum
            </Link>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Giriş Yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
} 