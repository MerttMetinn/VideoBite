import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
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
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Panel
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            Hakkında
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </nav>
  )
} 