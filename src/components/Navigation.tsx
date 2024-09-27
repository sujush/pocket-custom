import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Navigation() {
  return (
    <nav className="bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4 flex items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 mr-8">
          포켓커스텀
        </Link>
        <div className="flex items-center space-x-6 mr-auto">
          <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
            회사소개
          </Link>
          <Link href="/services" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
            문의게시판
          </Link>
          <Link href="/support" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
            고객 지원
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">로그인</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300">회원가입</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}