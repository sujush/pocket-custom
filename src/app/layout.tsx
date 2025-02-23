import type { Metadata } from 'next'
import { Inter, Noto_Sans } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })
const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
})

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
      <body className={`${inter.className} ${notoSans.className}`}>
        <Navigation />
        {children}
        <Toaster />
      </body>
    </html>
  )
}