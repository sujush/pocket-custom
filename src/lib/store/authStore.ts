// lib/store/authStore.ts

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin? : boolean; //관리자 여부
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  checkAuth: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_APIGATEWAY_URL;



export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove('token');
      },
      
      checkAuth: async () => {
        const token = Cookies.get('token');
        console.log("checkAuth: 쿠키에서 읽은 토큰:", token);

        if (token) {
          try {
            const response = await fetch(`${apiUrl}/UserSignup/verify-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            });
            const data = await response.json();

            if (data.success) {
              console.log("checkAuth: 인증 성공, 사용자 데이터:", data.user);
              set({ user: data.user, token, isAuthenticated: true });
            } else {
              console.log("checkAuth: 인증 실패");
              set({ user: null, token: null, isAuthenticated: false });
            }
          } catch (error) {
            console.error("checkAuth: 토큰 검증 실패:", error);
          }
        } else {
          console.log("checkAuth: 토큰 없음");
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: null,
        setAuth: state.setAuth,
        clearAuth: state.clearAuth,
        checkAuth: state.checkAuth,
      }),
    }
  )
);
