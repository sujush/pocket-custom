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

  // 여기부터 코드 수정
  useEffect(() => {
    console.log("ProtectedRoute 시작, isAuthenticated:", isAuthenticated);
    checkAuth(); // 페이지 접근 시 쿠키에서 토큰 확인

    if (!isAuthenticated) {
      console.log("isAuthenticated가 false여도 리다이렉트는 비활성화되었습니다.");
      // router.push('/login'); // 리다이렉션 제거
    }
  }, [isAuthenticated, router, checkAuth]);
  // 여기까지 코드 수정완료
  if (!isAuthenticated) {
    console.log("ProtectedRoute에서 isAuthenticated false로 반환");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
