// app/api/hscode/remaining-searches/route.ts
import { NextResponse } from 'next/server';
import { getRemainingSearches } from '@/lib/utils/rateLimit';

export async function GET(request: Request) {
  try {
    console.log('Fetching remaining searches...');
    const remaining = await getRemainingSearches(request);
    console.log('Remaining searches:', remaining);
    return NextResponse.json(remaining);
  } catch (error) {
    console.error('Error fetching remaining searches:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}