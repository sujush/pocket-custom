// components/LogoutButton.tsx
'use client'

import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const clearAuth = useAuthStore(state => state.clearAuth)
  const router = useRouter()

  const handleLogout = () => {
    // 전역 상태 초기화 (localStorage도 자동으로 클리어됨)
    clearAuth()
    
    // 쿠키 제거
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // 로그인 페이지로 리다이렉트
    router.push('/login')
  }

  return (
    <Button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white"
    >
      로그아웃
    </Button>
  )
}