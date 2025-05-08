import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Kullanıcı Paneli</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Özetlerim</h2>
          <p className="text-gray-600 mb-4">Kaydettiğiniz video özetleri</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">İşlemlerim</h2>
          <p className="text-gray-600 mb-4">Toplam işlenmiş video sayısı</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Ayarlar</h2>
          <p className="text-gray-600 mb-4">Hesap ayarlarınızı yönetin</p>
          <Link href="/settings">
            <Button variant="outline" size="sm">Ayarlara Git</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Son İşlemler</h2>
        <div className="p-6 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">Henüz işlenmiş bir video bulunmamaktadır.</p>
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