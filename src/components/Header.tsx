// components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import LogoutButton from "./LogoutButon";
import { Button } from "@/components/ui/button";
// 햄버거 아이콘
import { Menu, X } from "lucide-react";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 햄버거 메뉴 열림/닫힘
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 왼쪽: 환영 메세지 or 로그인 */}
        <div>
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 font-medium">
                환영합니다, {user?.name}님
              </span>
              {user?.isPremium && (
                <span className="ml-2 text-green-600">(프리미엄 회원)</span>
              )}
            </>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-gray-800">
              로그인
            </Link>
          )}
        </div>

        {/* 햄버거 아이콘 (sm:hidden) */}
        <button
          className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* 
          오른쪽 버튼들 (Logout, 회원가입, 프리미엄)
          - sm 이하: menuOpen 일 때만 표시
          - sm 이상: 가로로 표시
        */}
        <div
          className={`
            ${menuOpen ? "block" : "hidden"}
            absolute top-[64px] right-0 w-full bg-white sm:bg-transparent sm:static
            sm:w-auto sm:flex sm:items-center sm:space-x-4
          `}
        >
          {/* 만약 로그인됐다면 로그아웃 / 프리미엄 등 */}
          {isAuthenticated ? (
            <div className="px-4 py-2 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <LogoutButton />

              {!user?.isPremium && (
                <Link href="/upgrade">
                  <Button
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    프리미엄 회원 전환
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="px-4 py-2 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <Link href="/signup">
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setMenuOpen(false)}
                >
                  회원가입
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button
                  className="bg-yellow-500 text-white hover:bg-yellow-600"
                  onClick={() => setMenuOpen(false)}
                >
                  프리미엄 회원 전환
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
