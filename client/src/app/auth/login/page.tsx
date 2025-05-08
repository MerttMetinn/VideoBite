import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input 
              type="email" 
              placeholder="E-posta Adresi" 
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input 
              type="password" 
              placeholder="Şifre" 
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm">Beni Hatırla</label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Şifremi Unuttum
            </Link>
          </div>
          
          <Button className="w-full">Giriş Yap</Button>
        </div>
        
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