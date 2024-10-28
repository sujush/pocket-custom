'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn } from 'next-auth/react' // 소셜 로그인 함수

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
    phone: '',
    verificationCode: '',
  })

  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!agreeTerms) {
      alert('이용약관에 동의하셔야 합니다.')
      return
    }

    if (!isVerified) {
      alert('전화번호 인증을 완료해야 합니다.')
      return
    }

    console.log(formData)
    alert('회원가입이 완료되었습니다!')
  }

  const handleSendVerification = () => {
    if (!formData.phone) {
      alert('휴대전화 번호를 입력하세요.')
      return
    }
    setVerificationSent(true)
    alert('인증번호가 전송되었습니다.')
  }

  const handleVerifyCode = () => {
    if (formData.verificationCode === '123456') { // 예시
      setIsVerified(true)
      alert('전화번호 인증이 완료되었습니다.')
    } else {
      alert('인증번호가 일치하지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">회원가입</h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="email">아이디</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="아이디"
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
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">휴대전화</Label>
            <div className="flex space-x-2">
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="전화번호 입력"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              />
              <Button type="button" onClick={handleSendVerification} className="text-sm bg-blue-500 text-white px-3 py-2 rounded-md">
                인증번호 발송
              </Button>
            </div>
          </div>
          {verificationSent && (
            <div className="mb-4">
              <Label htmlFor="verificationCode">인증번호</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  placeholder="인증번호 입력"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                />
                <Button type="button" onClick={handleVerifyCode} className="text-sm bg-green-500 text-white px-3 py-2 rounded-md">
                  인증 확인
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <Checkbox
              id="agree-terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              이용약관, 개인정보 수집 및 이용에 모두 동의합니다.
            </Label>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={!agreeTerms || !isVerified}
            >
              가입하기
            </Button>
          </div>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">또는 소셜 계정으로 가입하기</p>
          <div className="mt-4 flex space-x-4">
            <Button
              onClick={() => signIn('google')}
              className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-medium"
            >
              구글로 가입하기
            </Button>
            <Button
              onClick={() => signIn('naver')}
              className="w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium"
            >
              네이버로 가입하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
