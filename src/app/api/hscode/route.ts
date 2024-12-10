import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Lambda URL과 환경변수를 사용해 Lambda 함수 호출
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
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json({ error: true, message: error.message || 'Server Error' }, { status: 500 });
  }
}
