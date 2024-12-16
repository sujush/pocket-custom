import { NextResponse } from 'next/server';
import { getRemainingSearches, checkIPLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
  try {
    // 검색 제한 확인
    const limitCheck = await checkIPLimit(request, 'single');
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: limitCheck.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const lambdaUrl = process.env.LAMBDA_HSCODE_ENDPOINT!;
    
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    const remainingSearches = await getRemainingSearches(request);

    // Lambda 응답과 remaining 정보를 합쳐서 반환
    return NextResponse.json({
      ...data,
      remaining: remainingSearches
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json(
      { error: true, message: (error as Error).message || 'Server Error' }, 
      { status: 500 }
    );
  }
}