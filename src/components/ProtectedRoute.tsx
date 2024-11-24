"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {

  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    console.log("ProtectedRoute 시작, isAuthenticated:", isAuthenticated);
    checkAuth(); // 페이지 접근 시 쿠키에서 토큰 확인
  }, [isAuthenticated, checkAuth]);

  // 수정 시작: 로그인 여부에 상관없이 children 렌더링
  console.log("isAuthenticated가 false여도 콘텐츠를 렌더링합니다.");
  return <>{children}</>;
  // 수정 끝
};

export default ProtectedRoute;
