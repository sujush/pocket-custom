// app/api/hscode/check-limit/route.ts
import { NextResponse } from 'next/server';
import { checkIPLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
    try {
      console.log('Check limit API called');
      const { searchType } = await request.json();
      console.log('Search type:', searchType);
      
      const result = await checkIPLimit(request, searchType);
      console.log('Check limit result:', result);
      
      if (!result.success) {
        console.log('Limit exceeded:', result.message);
        return NextResponse.json(
          { message: result.message },
          { status: 429 }
        );
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in check-limit API:', error);
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