// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware' // 새로고침해도 상태 유지

interface User {
  email: string
  name: string
  isPremium: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => 
        set({ user, token, isAuthenticated: true }),
      clearAuth: () => 
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 키 이름
    }
  )
)