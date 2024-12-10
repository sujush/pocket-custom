// app/api/hscode/remaining-searches/route.ts
import { NextResponse } from 'next/server';
import { getRemainingSearches } from '@/lib/utils/rateLimit';

export async function GET(request: Request) {
  try {
    const remaining = await getRemainingSearches(request);
    return NextResponse.json(remaining);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}