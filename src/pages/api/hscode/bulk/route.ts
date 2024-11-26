// app/api/hscode/bulk/route.ts
import { NextResponse } from 'next/server';
import { checkIPLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limit 체크 추가
    await checkIPLimit(request, 'bulk');
    
    const body = await request.json();
    // 기존 로직...
    
    return NextResponse.json({ data: body });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: error instanceof Error ? 429 : 500 }
    );
  }
}