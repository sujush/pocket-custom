import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <>
      <div className="bg-indigo-50 py-10 md:py-16 border-t border-indigo-100">
        <div className="container mx-auto px-4">
          {/* 
            수정:
            - 기본은 grid-cols-1 (모바일)
            - md부터 grid-cols-3 
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-indigo-800">상담센터</h3>
              <p className="text-gray-700">평일 09:00 - 18:00</p>
              <p className="text-gray-700">주말 및 공휴일 휴무</p>
              <p className="text-indigo-600 font-semibold mt-2">032-710-9432</p>
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-indigo-800">이연관세사무소 소개</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-700 hover:text-indigo-600">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-700 hover:text-indigo-600">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-700 hover:text-indigo-600">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-indigo-800">견적서 요청</h3>
              <p className="text-gray-700 mb-4">통관 견적 요청 시 메일주소를 입력해주세요</p>
              {/* 
                - 모바일에서 세로로 쌓이도록 (flex -> flex-col)
                - md부터 가로로 
              */}
              <div className="flex flex-col md:flex-row">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="px-4 py-2 border md:rounded-l-lg border-indigo-200 text-gray-800 bg-white md:flex-grow"
                />
                <Button className="mt-2 md:mt-0 md:rounded-r-lg md:border-l-0 bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
                  보내기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-indigo-900 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 이연관세사무소 포켓커스텀. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
