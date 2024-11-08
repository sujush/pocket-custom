// src/components/Auth/Login.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link' // Link import 추가

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
   setError('') // 입력이 변경되면 에러 메시지 초기화
 }

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   
   try {
     const response = await fetch(`${apiUrl}/UserSignup/login`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(formData),
     });

     const data = await response.json();

     if (response.ok) {
       // 전역 상태에 사용자 정보와 토큰 저장
       setAuth(data.user, data.token)
       
       alert('로그인 성공!')
       // 서비스 메인 페이지로 리다이렉트
       router.push('/services')
     } else {
       setError(data.message || '로그인에 실패했습니다.')
     }
   } catch (error) {
     console.error('로그인 중 오류 발생:', error)
     setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
   }
 }

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
         <div className="mb-4">
           <Label htmlFor="email">아이디</Label>
           <Input
             id="email"
             name="email"
             type="email"
             required
             placeholder="아이디 입력"
             value={formData.email}
             onChange={handleChange}
             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
           />
         </div>
         <div className="mb-4">
           <Label htmlFor="password">비밀번호</Label>
           <Input
             id="password"
             name="password"
             type="password"
             required
             placeholder="비밀번호 입력"
             value={formData.password}
             onChange={handleChange}
             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
           />
         </div>

          {/* 비밀번호 재설정 링크 추가 */}
          <div className="flex items-center justify-between">
           <div className="text-sm">
             <Link
               href="/components/Auth/reset-password"
               className="text-green-600 hover:text-green-500"
             >
               비밀번호를 잊으셨나요?
             </Link>
           </div>
         </div>

         <div>
           <Button
             type="submit"
             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
           >
             로그인
           </Button>
         </div>
       </form>

       {/* 소셜 로그인 버튼 섹션 */}
       <div className="mt-6">
         <p className="text-center text-sm text-gray-600">또는 소셜 계정으로 로그인하기</p>
         <div className="mt-4 flex space-x-4">
           <Button
             onClick={() => signIn('google')} // 구글 소셜 로그인 연동 예정
             className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-medium hover:bg-red-600"
           >
             구글로 로그인
           </Button>
           <Button
             onClick={() => signIn('naver')} // 네이버 소셜 로그인 연동 예정
             className="w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium hover:bg-green-600"
           >
             네이버로 로그인
           </Button>
         </div>
       </div>
     </div>
   </div>
 )
}