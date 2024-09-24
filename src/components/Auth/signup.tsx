// src/components/Auth/SignUp.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '@/lib/db';


export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (response.ok) {
      router.push('/login');
    } else {
      // 에러 처리
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
        required
      />
      <button type="submit">가입하기</button>
    </form>
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { email, password, name } = req.body;
      try {
        await createUser(email, password, name);
        res.status(200).json({ message: '회원가입 성공' });
      } catch (error) {
        res.status(400).json({ message: '회원가입 실패' });
      }
    } else {
      res.status(405).end();
    }
  }