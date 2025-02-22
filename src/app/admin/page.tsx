// src/app/admin/page.tsx
//도메인/admin 페이지로 접속해서 로그인 후 관리자 페이지 이용

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { checkIsAdmin, isAdminSessionValid } from '@/lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkIsAdmin() && isAdminSessionValid()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const id = formData.get('id') as string;
      const password = formData.get('password') as string;

      if (id === process.env.NEXT_PUBLIC_ADMIN_ID && 
          password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        toast.success('관리자로 로그인되었습니다');
        router.push('/dashboard');
      } else {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        toast.error('로그인에 실패했습니다');
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                name="id"
                type="text"
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}