// src/components/ProtectedRoute.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    console.log("ProtectedRoute 시작, isAuthenticated:", isAuthenticated);
    checkAuth();  // 페이지 접근 시 쿠키에서 토큰 확인

    if (!isAuthenticated) {
      console.log("isAuthenticated가 false여서 로그인 페이지로 이동");
      router.push('/login');
    }
  }, [isAuthenticated, router, checkAuth]);

  if (!isAuthenticated) {
    console.log("ProtectedRoute에서 isAuthenticated false로 반환");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
