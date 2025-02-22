//components/Auth/Login.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/authStore'
import Image from 'next/image'

const apiUrl = process.env.NEXT_PUBLIC_APIGATEWAY_URL;

export default function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore(state => state.setAuth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      console.log('Sending login request...');
      const response = await fetch(`${apiUrl}/UserSignup/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' //withCredentials 옵션 추가
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // 로그인 성공 시 상태 업데이트
        setAuth(data.user, data.token);

        // 디버깅을 위한 로그 추가
        console.log('로그인 성공 후 상태:', {
          user: useAuthStore.getState().user,
          token: useAuthStore.getState().token,
          isAuthenticated: useAuthStore.getState().isAuthenticated
        });

        // 성공 메시지 표시
        alert('로그인 성공!');

        // 홈 또는 서비스 페이지로 리다이렉트
        router.push('/');
      } else {
        // 서버에서 보낸 에러 메시지 표시
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: '/services',
        redirect: false,
      });

      if (result?.error) {
        setError('소셜 로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      setError('소셜 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">로그인</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email" className="sr-only">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            로그인
          </Button>
        </form>

        {/* 소셜 로그인 섹션 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                또는 소셜 계정으로 로그인
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <Image
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                width={20}
                height={20}
              />
              Google
            </button>

            <button
              onClick={() => handleSocialLogin('naver')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <Image
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/354927/naver.svg"
                alt="Naver logo"
                width={20}
                height={20}
              />
              Naver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}