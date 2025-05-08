import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>
      
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Profil Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad</label>
              <input 
                type="text" 
                placeholder="Ad Soyad" 
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input 
                type="email" 
                placeholder="E-posta Adresi" 
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <Button>Bilgileri Güncelle</Button>
          </div>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Görünüm Ayarları</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" id="darkMode" className="mr-2" />
              <label htmlFor="darkMode">Karanlık Mod</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="autoplay" className="mr-2" />
              <label htmlFor="autoplay">Otomatik Video Oynatma</label>
            </div>
            <Button>Görünüm Ayarlarını Kaydet</Button>
          </div>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mevcut Şifre</label>
              <input 
                type="password" 
                placeholder="Mevcut Şifre" 
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
              <input 
                type="password" 
                placeholder="Yeni Şifre" 
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre Tekrar</label>
              <input 
                type="password" 
                placeholder="Şifre Tekrar" 
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <Button>Şifreyi Değiştir</Button>
          </div>
        </div>
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/dashboard">
          <Button variant="outline" className="mr-2">Panele Dön</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
} 