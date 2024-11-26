// app/api/hscode/single/route.ts
import { NextResponse } from 'next/server';
import { checkIPLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
  try {
    const limitCheck = await checkIPLimit(request, 'single');
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: limitCheck.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hscode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}