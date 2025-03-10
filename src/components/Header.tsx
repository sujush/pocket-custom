// components/Header.tsx
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore'
import LogoutButton from './LogoutButon';
import { Button } from "@/components/ui/button";

export default function Header() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <header className="bg-white shadow">
      {/* 
        flex + justify-between + items-center 
        => 가로 일렬 배치 
      */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* 왼쪽: 환영메시지 or 로그인 링크 */}
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

        {/* 오른쪽: 로그아웃 or 회원가입/프리미엄 등 */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* 로그아웃 버튼 */}
              <LogoutButton />

              {/* 모바일에서는 숨기고, sm 이상에서만 보이도록 */}
              {!user?.isPremium && (
                <Link href="/upgrade" className="hidden sm:block">
                  <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
                    프리미엄 회원 전환
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                  회원가입
                </Button>
              </Link>

              {/* 모바일에서는 숨기고, sm 이상에서만 보이도록 */}
              <Link href="/upgrade" className="hidden sm:block">
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
                  프리미엄 회원 전환
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
