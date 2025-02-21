import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const API_KEY = process.env.NEXT_PUBLIC_TARIFF_RATE;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const url = `https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo?crkyCn=${API_KEY}&qryYymmDd=${today}&imexTp=2`;

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