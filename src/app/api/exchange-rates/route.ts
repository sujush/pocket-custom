import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const BASE_URL = process.env.NEXT_PUBLIC_TARIFF_RATE;

    if (!BASE_URL) {
      return NextResponse.json(
        { error: 'API URL이 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // URL에서 인증키 추출
    const urlObj = new URL(BASE_URL);
    const params = new URLSearchParams(urlObj.search);
    const crkyCn = params.get('crkyCn');

    if (!crkyCn) {
      return NextResponse.json(
        { error: '인증키가 URL에 포함되어 있지 않습니다' },
        { status: 500 }
      );
    }

    // 새로운 URL 구성
    const url = `${urlObj.origin}${urlObj.pathname}?crkyCn=${crkyCn}&qryYymmDd=${today}&imexTp=2`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: '관세청 API 요청 실패' },
        { status: response.status }
      );
    }

    const xmlText = await response.text();
    
    return new NextResponse(xmlText, {
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Exchange rates fetch error:', error);
    return NextResponse.json(
      { error: '환율 정보를 가져오는데 실패했습니다' },
      { status: 500 }
    );
  }
}