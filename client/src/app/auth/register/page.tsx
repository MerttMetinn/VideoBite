'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { authApi } from '@/lib/api';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast("Hata!", {
        description: "Lütfen tüm alanları doldurun.",
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast("Hata!", {
        description: "Şifreler eşleşmiyor.",
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    if (!acceptTerms) {
      toast("Hata!", {
        description: "Kullanım şartlarını kabul etmelisiniz.",
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // API isteği yap
      await authApi.register(name, email, password);
      
      // Başarılı kayıt mesajı göster
      toast("Kayıt başarılı!", {
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz."
      });
      
      // Kullanıcıyı giriş sayfasına yönlendir
      router.push('/auth/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      // Hata mesajını göster
      const errorMessage = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu';
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
        <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <Input 
              type="text" 
              placeholder="Ad Soyad" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Şifre Tekrar</label>
            <Input 
              type="password" 
              placeholder="Şifre Tekrar" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="terms" 
              className="mr-2"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="terms" className="text-sm">
              <span>Kullanım şartlarını ve gizlilik politikasını</span>{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                kabul ediyorum
              </Link>
            </label>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kayıt Yapılıyor...
              </>
            ) : (
              'Kayıt Ol'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Giriş Yap
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