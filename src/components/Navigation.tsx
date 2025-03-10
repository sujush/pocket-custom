// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useAuthStore } from '@/lib/store/authStore'

// 타입 정의
interface User {
  name: string
  isPremium: boolean
}

// useAuthStore 상태 타입 정의
interface AuthStore {
  isAuthenticated: boolean
  user: User | null
  clearAuth: () => void
}

export default function Navigation() {
  const router = useRouter()
  const { isAuthenticated, user, clearAuth } = useAuthStore() as AuthStore

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  return (
    // ========================================
    // 수정: 모바일에서 세로(stack), 
    //       sm 이상의 화면부터 가로 배치
    // ========================================
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        
        {/* 
          (왼쪽) 브랜드/로고 
          - 모바일에서는 한 줄 차지, 
          - sm 이상부터 오른쪽으로 메뉴/버튼 등 배치 
        */}
        <div className="flex items-center justify-between mb-4 sm:mb-0">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            포켓커스텀
          </Link>
        </div>

        {/* 
          (중간) 기본 메뉴 링크들 
          - 모바일에서 한 줄 아래로 내려감
          - sm 이상에서는 가로로 나열 (space-x-6)
        */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-4 sm:mb-0">
          <Link
            href="/about"
            className="text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-2 sm:mb-0"
          >
            회사소개
          </Link>
          <Link
            href="/board"
            className="text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-2 sm:mb-0"
          >
            문의게시판
          </Link>
          <Link
            href="/support"
            className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            고객 지원
          </Link>
        </div>

        {/* 
          (오른쪽) 로그인 / 회원가입 / 로그아웃 등
          - 모바일에선 다음 줄에 표시
          - sm 이상에서는 오른쪽 끝에 표시
        */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600 mb-2 sm:mb-0">
                {user?.name}님 환영합니다
                {user?.isPremium && " (프리미엄)"}
              </span>

              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-800 mb-2 sm:mb-0"
                onClick={handleLogout}
              >
                로그아웃
              </Button>

              {!user?.isPremium && (
                <Link href="/upgrade" className="mb-2 sm:mb-0">
                  <Button className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-300">
                    프리미엄 회원 전환
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="mb-2 sm:mb-0">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                  로그인
                </Button>
              </Link>
              <Link href="/signup" className="mb-2 sm:mb-0">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300">
                  회원가입
                </Button>
              </Link>
              <Link href="/upgrade" className="mb-2 sm:mb-0">
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-300">
                  프리미엄 회원 전환
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
