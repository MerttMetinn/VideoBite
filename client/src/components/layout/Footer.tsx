import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">VideoBite</h3>
            <p className="text-gray-600">
              Video içeriklerinizi hızlıca özetleyin ve analiz edin.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/video" className="text-gray-600 hover:text-gray-900">
                  Video Özeti
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Panel
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  Hakkında
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">İletişim</h3>
            <ul className="space-y-2 text-gray-600">
              <li>info@videobite.com</li>
              <li>+90 555 123 4567</li>
              <li>İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} VideoBite. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
} 