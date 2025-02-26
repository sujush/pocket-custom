// app/api/forwarder-detail/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // URL에서 code 파라미터 추출
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: '부호가 필요합니다.' }, { status: 400 });
  }
  
  try {
    // 관세청 API 호출
    const API_KEY = process.env.CUSTOMS_API_KEY || 'z220q204y161w234v060f010a0'; // 추후 환경변수로 변환
    const url = `https://unipass.customs.go.kr:38010/ext/rest/frwrBrkdQry/retrieveFrwrBrkd?crkyCn=${API_KEY}&frwrSgn=${encodeURIComponent(code)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml',
        'Content-Type': 'application/xml'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // XML 응답을 그대로 클라이언트에 전달
    return new NextResponse(xmlText, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error(`화물운송주선업자 내역 조회 오류 (${code}):`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}