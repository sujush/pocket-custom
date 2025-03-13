// app/api/kc-certification/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 환경 변수에서 API 키 가져오기
const API_AUTH_KEY = process.env.SAFETY_KOREA_API_KEY;
const BASE_URL = 'http://www.safetykorea.kr/openapi/api/cert';

export const fetchCache = 'force-no-store'; // 캐싱 비활성화
export const revalidate = 0; // 재검증 비활성화
export const dynamic = 'force-dynamic'; // 동적 렌더링 강제

// 간단한 메모리 캐시 구현
const cache = new Map();
const CACHE_TTL = 3600000; // 1시간(밀리초)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conditionKey = searchParams.get('conditionKey');
  const conditionValue = searchParams.get('conditionValue');

  if (!API_AUTH_KEY) {
    return NextResponse.json(
      { resultCode: '5000', resultMsg: 'API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.', resultData: [] },
      { status: 500 }
    );
  }

  if (!conditionKey) {
    return NextResponse.json(
      { resultCode: '4000', resultMsg: '검색 조건이 지정되지 않았습니다.', resultData: [] },
      { status: 400 }
    );
  }

  // 캐시 키 생성
  const cacheKey = `cert_search_${conditionKey}_${conditionValue || ''}`;
  
  // 캐시 확인
  const cachedItem = cache.get(cacheKey);
  if (cachedItem && cachedItem.expiry > Date.now()) {
    console.log(`[캐시] 검색 조건 ${conditionKey}=${conditionValue || ''}에 대한 캐시된 결과 반환`);
    return NextResponse.json(cachedItem.data);
  }

  try {
    // SafetyKorea API 호출
    const apiUrl = `${BASE_URL}/certificationList.json?conditionKey=${conditionKey}&conditionValue=${encodeURIComponent(conditionValue || '')}`;
    
    console.log(`[API 요청] 검색 조건 ${conditionKey}=${conditionValue || ''}에 대한 요청`, apiUrl);
    
    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await fetch(apiUrl, {
      headers: {
        'AuthKey': API_AUTH_KEY,
        'Accept': 'application/json'
      },
      signal: controller.signal,
      next: { revalidate: 0 }
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 오류:', response.status, errorText.substring(0, 200));
      return NextResponse.json(
        { 
          resultCode: response.status.toString(), 
          resultMsg: `외부 API 호출 중 오류가 발생했습니다 (${response.status})`, 
          resultData: [] 
        },
        { status: 500 }
      );
    }

    // 콘텐츠 타입 확인
    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('API가 JSON이 아닌 응답을 반환했습니다:', text.substring(0, 200));
      return NextResponse.json(
        { resultCode: '5000', resultMsg: 'API가 적절한 JSON 응답을 반환하지 않았습니다', resultData: [] },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // 캐시에 저장
    if (data.resultCode === '2000' || data.resultCode === 2000) {
      console.log(`[캐시] 검색 조건 ${conditionKey}=${conditionValue || ''}에 대한 결과 캐싱`);
      cache.set(cacheKey, {
        data: data,
        expiry: Date.now() + CACHE_TTL
      });
      
      // 주기적인 캐시 정리 (선택사항)
      cleanupCache();
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    // AbortError 타임아웃 처리
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { resultCode: '5000', resultMsg: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.', resultData: [] },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { resultCode: '5000', resultMsg: `서버에서 요청을 처리하는 중 오류가 발생했습니다: ${errorMessage}`, resultData: [] },
      { status: 500 }
    );
  }
}

// 캐시 정리 함수 (오래된 항목 제거)
function cleanupCache() {
  const now = Date.now();
  // Array.from()을 사용하여 호환성 문제 해결
  Array.from(cache.keys()).forEach(key => {
    const value = cache.get(key);
    if (value && value.expiry < now) {
      cache.delete(key);
    }
  });
}