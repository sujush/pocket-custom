// layout.tsx (수정 후)
import type { Metadata } from 'next'
import { Inter, Noto_Sans } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Toaster } from "@/components/ui/toaster"
// 1) Vercel Analytics 컴포넌트 임포트
import { Analytics } from "@vercel/analytics/react"

// 폰트 설정
const inter = Inter({ subsets: ['latin'] })
const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
})

// ======================
// = 수정된 부분 시작  =
// ======================
export const metadata: Metadata = {
  title: '포켓커스텀',
  description: '내 손 안의 작은 관세사',
  // (1) 뷰포트 설정 추가
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
  },
}
// ======================
// = 수정된 부분 끝   =
// ======================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${notoSans.className}`}>
        {/* (2) 페이지 상단에 네비게이션 */}
        <Navigation />

        {/* (3) 자식(페이지)들 렌더 */}
        {children}

        {/* (4) Toast 메시지 표시용 컴포넌트 */}
        <Toaster />

        {/* (5) Vercel Analytics 컴포넌트 렌더링 */}
        <Analytics />
      </body>
    </html>
  )
}
