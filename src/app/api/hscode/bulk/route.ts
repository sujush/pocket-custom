import { NextResponse } from 'next/server';
import { checkIPLimit, getRemainingSearches } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
  try {
    // 검색 횟수 제한 확인
    const limitCheck = await checkIPLimit(request, 'bulk');
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: limitCheck.message },
        { status: 429 }
      );
    }

    // 클라이언트 요청 데이터 처리
    const { products } = await request.json();
    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { message: '잘못된 요청 데이터입니다.' },
        { status: 400 }
      );
    }

    // Lambda 함수를 호출해 OpenAI API를 통해 6자리 HS CODE 조회
    const lambdaResponse = await fetch(process.env.LAMBDA_BULK_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });

    if (!lambdaResponse.ok) {
      throw new Error('Lambda 함수 호출 실패');
    }

    const responseData = await lambdaResponse.json();

    // 남은 검색 횟수 계산 및 반환
    const remainingSearches = await getRemainingSearches(request);
    return NextResponse.json({
      hscodes: responseData,
      remaining: remainingSearches,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
