// app/api/kc-certification/detail/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 환경 변수에서 API 키 가져오기
const API_AUTH_KEY = process.env.SAFETY_KOREA_API_KEY || 'b85357b5-aa22-aaaa-aaaa-6980';
const BASE_URL = 'http://www.safetykorea.kr/openapi/api/cert';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const certNum = searchParams.get('certNum');

  if (!certNum) {
    return NextResponse.json(
      { resultCode: '4000', resultMsg: '인증번호가 지정되지 않았습니다.', resultData: {} },
      { status: 400 }
    );
  }

  try {
    // SafetyKorea API 호출
    const apiUrl = `${BASE_URL}/certificationDetail.json?certNum=${certNum}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'AuthKey': API_AUTH_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 오류:', errorText);
      return NextResponse.json(
        { resultCode: '5000', resultMsg: '외부 API 호출 중 오류가 발생했습니다.', resultData: {} },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    return NextResponse.json(
      { resultCode: '5000', resultMsg: '서버에서 요청을 처리하는 중 오류가 발생했습니다.', resultData: {} },
      { status: 500 }
    );
  }
}