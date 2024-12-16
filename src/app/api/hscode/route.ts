import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Lambda URL 읽어오기
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

    // ▼ 여기서부터 수정한 부분 시작 ▼
    const data = await response.json();

    // Lambda 응답 예시: { hsCode: "123456", remainingSearches: 6 }
    // remainingSearches 값을 이용해 bulk 코드처럼 remaining 구조로 만들어줌
    if (data.hsCode && typeof data.remainingSearches === 'number') {
      return NextResponse.json({
        hsCode: '123456',
        remaining: {
          single: 10, // Lambda에서 받은 검색 횟수를 single에 매핑
          bulk: 50,                       // bulk는 임의로 50으로 설정 (원한다면 다른 숫자로 조정 가능)
          isLimited: true,                // isLimited 값은 true로 설정
        }
      }, { status: 200 });
    } else {
      // 만약 Lambda 응답 형식이 우리가 예상한 것과 다르다면,
      // 기존 data를 그대로 반환해서 기능 유지
      return NextResponse.json(data, { status: 200 });
    }
    // ▲ 수정한 부분 끝 ▲

  } catch (error: unknown) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json({ error: true, message: (error as Error).message || 'Server Error' }, { status: 500 });
  }
}
