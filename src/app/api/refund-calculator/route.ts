import axios, { AxiosError } from 'axios';
import https from 'https';
import { parseStringPromise } from 'xml2js';
import { NextResponse } from 'next/server';

interface SimlXamrttXtrnUserQryResponse {
  simlXamrttXtrnUserQryRtnVo: {
    ntceInfo: string;
    tCnt: string;
    simlXamrttXtrnUserQryRsltVo: Array<{
      prutDrwbWncrAmt: string;
      stsz: string;
      drwbAmtBaseTpcd: string;
      aplyDd: string;
      ceseDt: string;
      hs10: string;
    }>;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hsCode = searchParams.get('hsCode');

  // 1) hsCode가 누락되었는지 확인
  if (!hsCode) {
    return NextResponse.json(
      { error: 'hsCode 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  // 2) 환경변수가 있는지 확인
  if (!process.env.NEXT_PUBLIC_REFUND_API) {
    return NextResponse.json(
      { error: 'API 경로(NEXT_PUBLIC_REFUND_API)가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }
  if (!process.env.NEXT_PUBLIC_CUSTOMS_KEY) {
    return NextResponse.json(
      { error: '인증키(NEXT_PUBLIC_CUSTOMS_KEY)가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    // 3) HTTPS Agent 설정 (TLS 1.2 이상)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    });

    // 4) 베이스 URL 생성
    //    (여기에 ?crkyCn=... 등 쿼리는 붙이지 않고, 아래서 파라미터로 추가)
    const urlObj = new URL(process.env.NEXT_PUBLIC_REFUND_API);

    // 5) 필수 파라미터를 코드에서 붙임
    urlObj.searchParams.set('crkyCn', process.env.NEXT_PUBLIC_CUSTOMS_KEY);
    urlObj.searchParams.set('baseDt', '19930201');
    urlObj.searchParams.set('hsSgn', hsCode);

    console.log('[DEBUG] 최종 호출 URL:', urlObj.toString());

    // 6) API 호출
    const response = await axios.get(urlObj.toString(), {
      httpsAgent,
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/xml',
      },
      timeout: 10000,
    });

    // 7) XML -> JSON 변환
    const parsedResult = (await parseStringPromise(response.data)) as SimlXamrttXtrnUserQryResponse;

    // 8) 응답 검증
    if (!parsedResult.simlXamrttXtrnUserQryRtnVo) {
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      switch (axiosError.response?.status) {
        case 401:
        case 403:
          return NextResponse.json(
            { error: 'API 접근이 거부되었습니다.' },
            { status: 403 }
          );
        case 404:
          return NextResponse.json(
            { error: '요청한 정보를 찾을 수 없습니다(404).' },
            { status: 404 }
          );
        case 429:
          return NextResponse.json(
            { error: 'API 호출 한도를 초과했습니다.' },
            { status: 429 }
          );
        default:
          return NextResponse.json(
            { error: '서버 에러가 발생했습니다.' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
