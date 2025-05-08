import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h1>
        
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input 
              type="password" 
              placeholder="Şifre" 
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
          
          <div className="flex items-center">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-sm">
              <span>Kullanım şartlarını ve gizlilik politikasını</span>{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                kabul ediyorum
              </Link>
            </label>
          </div>
          
          <Button className="w-full">Kayıt Ol</Button>
        </div>
        
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