import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6 text-center">VideoBite</h1>
      <p className="text-center mb-8">Video içeriklerinizi hızlıca özetleyin ve analiz edin</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Link href="/video" className="w-full">
          <Button className="w-full h-16 text-lg">Video Özeti Oluştur</Button>
        </Link>
        <Link href="/dashboard" className="w-full">
          <Button variant="outline" className="w-full h-16 text-lg">Panele Git</Button>
        </Link>
        <Link href="/about" className="w-full">
          <Button variant="secondary" className="w-full h-16 text-lg">Hakkında</Button>
        </Link>
        <Link href="/auth/login" className="w-full">
          <Button variant="outline" className="w-full h-16 text-lg">Giriş Yap</Button>
        </Link>
      </div>
    </div>
  )
}
