import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <>
      <div className="bg-indigo-50 py-16 border-t border-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-800">상담센터</h3>
              <p className="text-gray-700">평일 09:00 - 18:00</p>
              <p className="text-gray-700">주말 및 공휴일 휴무</p>
              <p className="text-indigo-600 font-semibold mt-2">032-710-9432</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-800">포켓커스텀 소개</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-700 hover:text-indigo-600">회사 소개</Link></li>
                <li><Link href="/terms" className="text-gray-700 hover:text-indigo-600">이용약관</Link></li>
                <li><Link href="/privacy" className="text-gray-700 hover:text-indigo-600">개인정보처리방침</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-800">뉴스레터 구독</h3>
              <p className="text-gray-700 mb-4">최신 소식과 혜택을 받아보세요</p>
              <div className="flex">
                <input type="email" placeholder="이메일 주소" className="flex-grow px-4 py-2 rounded-l-lg border-t border-b border-l text-gray-800 border-indigo-200 bg-white" />
                <Button className="rounded-r-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">구독</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-indigo-900 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 포켓커스텀. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}