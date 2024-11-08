// src/components/ProtectedRoute.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isLoading = useState(true)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/components/Auth/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // 로딩 중이거나 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null
  }

  // 인증된 경우에만 children 렌더링
  return <>{children}</>
}

export default ProtectedRoute