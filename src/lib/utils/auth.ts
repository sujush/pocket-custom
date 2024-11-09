// lib/utils/auth.ts
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'

export const useHandleTokenExpiration = () => {
  const router = useRouter();

  const handleTokenExpiration = (error: { status: number }) => {
    if (error.status === 401) {
      const clearAuth = useAuthStore.getState().clearAuth
      clearAuth()
      router.push('/components/Auth/login?expired=true')
    }
  }

  return handleTokenExpiration;
}