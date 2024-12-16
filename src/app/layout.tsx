import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Toaster } from "@/components/ui/toaster"

// 추가: RemainingSearchesProvider를 임포트
import { RemainingSearchesProvider } from '@/app/RemainingSearchesContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '포켓커스텀',
  description: '통관 및 물류 컨설팅 웹사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Navigation />
        {/* 추가: RemainingSearchesProvider로 감싸서 모든 자식이 검색횟수 상태를 공유하도록 함 */}
        <RemainingSearchesProvider>
          {children}
        </RemainingSearchesProvider>
        <Toaster />
      </body>
    </html>
  )
}
