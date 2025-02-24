//app/api/refund-calculator/route.ts

import axios, { AxiosError } from 'axios';
import https from 'https';
import { parseStringPromise } from 'xml2js';
import { NextResponse } from 'next/server';

interface SimlXamrttXtrnUserQryResponse {
  simlXamrttXtrnUserQryRtnVo?: Array<{
    simlXamrttXtrnUserQryRsltVo?: Array<{
      prutDrwbWncrAmt?: string[]; // 단위당 환급금액
      stsz?: string[];            // 품목명
      hs10?: string[];            // HS 10자리 코드
      aplyDd?: string[];          // 적용일자
      ceseDt?: string[];          // 중지일자
      drwbAmtBaseTpcd?: string[]; // 환급액계기준구분코드
    }>;
  }>;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  code?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hsCode = searchParams.get('hsCode');

  if (!hsCode) {
    return NextResponse.json(
      { error: 'hsCode 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  if (!process.env.NEXT_PUBLIC_REFUND_API) {
    return NextResponse.json(
      { error: 'API 설정이 누락되었습니다.' },
      { status: 500 }
    );
  }

  try {
    // HTTPS Agent 설정 (TLS 1.2 이상 사용)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    });

    // API URL 구성
    const urlObj = new URL(process.env.NEXT_PUBLIC_REFUND_API);
    
    // 필수 파라미터 설정
    const params = {
      baseDt: '19930201',          // 기준일자
      hs10: hsCode,                // HS코드
      stsz: '500',                 // 규격
      drwbAmtBaseTpcd: '1',        // 환급액계기준구분코드
      aplyDd: '19930201',          // 적용일자
      ceseDt: '19940131'           // 중지일자
    };

    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });

    // API 호출 설정
    const response = await axios.get(urlObj.toString(), {
      httpsAgent,
      headers: {
        'Accept': 'application/xml',
        'Content-Type': 'application/xml'
      },
      timeout: 10000 // 10초 타임아웃
    });
    
    // XML 응답 파싱
    const parsedResult = (await parseStringPromise(response.data)) as SimlXamrttXtrnUserQryResponse;
    
    // 응답 검증
    if (!parsedResult.simlXamrttXtrnUserQryRtnVo) {
      throw new Error('잘못된 응답 형식입니다.');
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      // HTTP 상태코드별 에러 처리
      switch (axiosError.response?.status) {
        case 401:
        case 403:
          return NextResponse.json(
            { error: 'API 접근이 거부되었습니다.' },
            { status: 403 }
          );
        case 404:
          return NextResponse.json(
            { error: '요청한 정보를 찾을 수 없습니다.' },
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