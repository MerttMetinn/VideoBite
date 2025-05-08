import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VideoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Video Özeti</h1>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">YouTube Linkini Girin</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="flex-1 p-3 border border-gray-300 rounded-md"
            />
            <Button className="md:w-auto">Özet Oluştur</Button>
          </div>
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