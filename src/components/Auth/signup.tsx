'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const apiUrl = process.env.NEXT_PUBLIC_APIGATEWAY_URL;

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
  })

  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateBirthDate = () => {
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      alert('생년월일을 모두 입력해주세요.')
      return false
    }

    const year = parseInt(formData.birthYear)
    const month = parseInt(formData.birthMonth)
    const day = parseInt(formData.birthDay)

    if (year < 1900 || year > new Date().getFullYear()) {
      alert('올바른 연도를 입력해주세요.')
      return false
    }

    if (month < 1 || month > 12) {
      alert('올바른 월을 입력해주세요.')
      return false
    }

    if (day < 1 || day > 31) {
      alert('올바른 일자를 입력해주세요.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreeTerms) {
      alert('이용약관에 동의하셔야 합니다.');
      return;
    }

    if (!validateBirthDate()) {
      return;
    }

    const signupData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      birthYear: formData.birthYear,
      birthMonth: formData.birthMonth.padStart(2, '0'),
      birthDay: formData.birthDay.padStart(2, '0'),
      isPremium
    };

    try {
      const response = await fetch(`${apiUrl}/UserSignup/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        
        },
        credentials: 'include', // 쿠키를 포함한 인증 정보 전송
        mode: 'cors',
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`서버 응답 오류: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        alert('회원가입이 완료되었습니다!');
        // 회원가입 성공 시 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      } else {
        alert(result.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }; // handleSubmit 함수의 닫는 중괄호 추가

  // JSX 코드 시작
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">회원가입</h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              className="mt-1"
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
              className="mt-1"
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
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label>생년월일</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input
                name="birthYear"
                type="text"
                placeholder="년도"
                value={formData.birthYear}
                onChange={handleChange}
                maxLength={4}
              />
              <Input
                name="birthMonth"
                type="text"
                placeholder="월"
                value={formData.birthMonth}
                onChange={handleChange}
                maxLength={2}
              />
              <Input
                name="birthDay"
                type="text"
                placeholder="일"
                value={formData.birthDay}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="agree-terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              이용약관에 동의합니다
            </Label>
          </div>

          <div className="flex items-center mt-4">
            <Checkbox
              id="premium-option"
              checked={isPremium}
              onChange={(e) => setIsPremium((e.target as HTMLInputElement).checked)}
            />
            <Label htmlFor="premium-option" className="ml-2 block text-sm text-gray-900">
              프리미엄 회원으로 가입
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!agreeTerms}
          >
            가입하기
          </Button>
        </form>
      </div>
    </div>
  );
}