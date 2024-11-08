// components/Header.tsx
import { useAuthStore } from '@/lib/store/authStore'
import LogoutButton from './LogoutButton'

export default function Header() {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        {isAuthenticated ? (
          <>
            <div>
              <span className="text-gray-700">환영합니다, {user?.name}님</span>
              {user?.isPremium && (
                <span className="ml-2 text-green-600">(프리미엄 회원)</span>
              )}
            </div>
            <LogoutButton />
          </>
        ) : (
          <Link href="/components/Auth/login">로그인</Link>
        )}
      </div>
    </header>
  )
}