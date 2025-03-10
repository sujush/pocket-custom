// components/Header.tsx
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore'
import LogoutButton from './LogoutButon';

export default function Header() {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <header className="bg-white shadow">
      {/* 
        - 수정: 모바일에선 flex-col, 
          sm(640px)부터 가로 배치 
      */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        
        {/* 
          - 왼쪽 영역(사용자 환영 메시지) 
          - sm 이하에서는 한 줄, sm 이상에서는 왼쪽에 위치
        */}
        {isAuthenticated ? (
          <div>
            <span className="text-gray-700">환영합니다, {user?.name}님</span>
            {user?.isPremium && (
              <span className="ml-2 text-green-600">(프리미엄 회원)</span>
            )}
          </div>
        ) : (
          <Link href="/components/Auth/login">로그인</Link>
        )}

        {/* 
          - 오른쪽(혹은 아래) 로그아웃 버튼 
        */}
        {isAuthenticated && (
          <div>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  )
}
