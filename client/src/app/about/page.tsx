import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Hakkında</h1>
      
      <div className="prose max-w-3xl mx-auto">
        <p className="text-lg mb-4">
          VideoBite, uzun video içeriklerini hızlı bir şekilde özetlemenizi ve analiz etmenizi sağlayan 
          kullanıcı dostu bir platformdur.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Özellikler</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>YouTube videolarından otomatik transkript çıkarma</li>
          <li>Yapay zeka destekli özet oluşturma</li>
          <li>Anahtar noktaları belirleme</li>
          <li>Özetleri kaydetme ve paylaşma</li>
          <li>Çoklu dil desteği</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Nasıl Çalışır?</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>YouTube video bağlantınızı girin</li>
          <li>Transkript otomatik olarak çıkarılır</li>
          <li>Yapay zeka içeriği analiz eder</li>
          <li>Kısa bir özet ve anahtar noktalar oluşturulur</li>
          <li>Özeti kaydedebilir veya paylaşabilirsiniz</li>
        </ol>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">İletişim</h2>
        <p>Sorularınız veya geri bildirimleriniz için: info@videobite.com</p>
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
} 