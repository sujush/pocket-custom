// app/api/hscode/check-limit/route.ts
import { NextResponse } from 'next/server';
import { checkIPLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
  try {
    const { searchType } = await request.json();
    const result = await checkIPLimit(request, searchType);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}