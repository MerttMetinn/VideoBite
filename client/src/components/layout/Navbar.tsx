'use client';

import { useState, useEffect } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Oturum durumunu kontrol et
  const checkAuthStatus = async () => {
    try {
      // LocalStorage'dan kontrol et
      if (authApi.isAuthenticated()) {
        // Kullanıcı bilgilerini al
        try {
          const userResponse = await authApi.getMe();
          setIsLoggedIn(true);
          setUserName(userResponse.user.name);
        } catch (error) {
          // Token geçersiz veya süresi dolmuşsa çıkış yap
          console.error("Kullanıcı bilgileri alınamadı", error);
          authApi.logout();
          setIsLoggedIn(false);
          setUserName('');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    } catch (error) {
      console.error("Oturum kontrolü sırasında hata:", error);
      setIsLoggedIn(false);
    }
  };
  
  // Çıkış işlemi
  const handleLogout = () => {
    setIsLoading(true);
    
    // Çıkış işlemini yap
    authApi.logout();
    
    // State'i güncelle
    setIsLoggedIn(false);
    setUserName('');
    
    // Bildirim göster
    toast("Çıkış yapıldı", {
      description: "Başarıyla çıkış yaptınız."
    });
    
    // Ana sayfaya yönlendir
    router.push('/');
    
    setIsLoading(false);
  };

  return (
    <nav className="bg-white border-b py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          VideoBite
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/video" className="text-gray-600 hover:text-gray-900">
            Video Özeti
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Panel
            </Link>
          )}
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            Hakkında
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <span className="text-sm mr-2">Merhaba, {userName || 'Kullanıcı'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoading}
              >
                Çıkış
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Giriş
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Kayıt Ol
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 