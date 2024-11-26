// src/lib/utils/rateLimit.ts

const ipLimitStore = new Map<string, {
  singleSearchCount: number;
  bulkSearchCount: number;
  lastReset: Date;
}>();

// IP 주소 추출 함수 수정
const getClientIP = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
};

export const checkIPLimit = async (
  request: Request, 
  searchType: 'single' | 'bulk'
): Promise<boolean> => {
  const RATE_LIMIT_ENABLED = process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true';
  if (!RATE_LIMIT_ENABLED) return true;

  const ip = getClientIP(request);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let limitInfo = ipLimitStore.get(ip);

  if (!limitInfo || limitInfo.lastReset < today) {
    limitInfo = {
      singleSearchCount: 0,
      bulkSearchCount: 0,
      lastReset: today
    };
  }

  const limit = searchType === 'single' 
    ? Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT)
    : Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT);

  const count = searchType === 'single' 
    ? limitInfo.singleSearchCount 
    : limitInfo.bulkSearchCount;

  if (count >= limit) {
    throw new Error(`${searchType === 'single' ? '개별' : '벌크'} 검색 일일 한도를 초과했습니다.`);
  }

  if (searchType === 'single') {
    limitInfo.singleSearchCount++;
  } else {
    limitInfo.bulkSearchCount++;
  }

  ipLimitStore.set(ip, limitInfo);
  return true;
};

export const getRemainingSearches = (request: Request) => {
  const RATE_LIMIT_ENABLED = process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true';
  if (!RATE_LIMIT_ENABLED) {
    return {
      single: Infinity,
      bulk: Infinity,
      isLimited: false
    };
  }

  const ip = getClientIP(request);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limitInfo = ipLimitStore.get(ip);
  const singleLimit = Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT);
  const bulkLimit = Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT);

  if (!limitInfo || limitInfo.lastReset < today) {
    return {
      single: singleLimit,
      bulk: bulkLimit,
      isLimited: true
    };
  }

  return {
    single: Math.max(0, singleLimit - limitInfo.singleSearchCount),
    bulk: Math.max(0, bulkLimit - limitInfo.bulkSearchCount),
    isLimited: true
  };
};