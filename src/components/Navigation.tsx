// components/Navigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
// Lucide-react 아이콘(햄버거, X) 예시
import { Menu, X } from "lucide-react";

// 유저 타입
interface User {
  name: string;
  isPremium: boolean;
}

// AuthStore 타입
interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  clearAuth: () => void;
}

export default function Navigation() {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore() as AuthStore;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          포켓커스텀
        </Link>

        {/* 햄버거 아이콘 (모바일 전용, sm:hidden) */}
        <button
          className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* 
          오른쪽 메뉴들 (회사소개/문의게시판/고객지원 + 로그인/회원가입/등등)
          - 기본: hidden (모바일에서 햄버거 누르기 전까지)
          - sm 이상: flex (수평 메뉴)
        */}
        <div
          className={`
            ${menuOpen ? "block" : "hidden"}
            absolute top-[64px] left-0 w-full bg-white sm:bg-transparent sm:static sm:w-auto 
            sm:flex sm:items-center sm:space-x-6
          `}
        >
          {/* 
            모바일에서는 세로 스택 
            sm 이상에서는 가로(space-x-6)
          */}
          <ul className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <li>
              <Link
                href="/about"
                className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                회사소개
              </Link>
            </li>
            <li>
              <Link
                href="/board"
                className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                문의게시판
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                고객 지원
              </Link>
            </li>
          </ul>

          {/* 구분선 (모바일에서만 보이도록) */}
          <hr className="my-2 border-gray-200 sm:hidden" />

          {/* 
            인증 상태에 따른 버튼들 
            모바일에선 세로로, sm 이상에서 가로로
          */}
          <div className="px-4 py-2 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 mb-2 sm:mb-0">
                  {user?.name}님 환영합니다
                  {user?.isPremium && " (프리미엄)"}
                </span>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800 mb-2 sm:mb-0"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
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
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" className="mb-2 sm:mb-0">
                  <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    회원가입
                  </Button>
                </Link>
                <Link href="/upgrade" className="mb-2 sm:mb-0">
                  <Button
                    className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    프리미엄 회원 전환
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
