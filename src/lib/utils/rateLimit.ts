// src/lib/utils/rateLimit.ts
interface LimitInfo {
    singleSearchCount: number;
    bulkSearchCount: number;
    lastReset: Date;
  }
  
  interface LimitCheckResult {
    success: boolean;
    message?: string;
  }
  
  interface RemainingSearches {
    single: number;
    bulk: number;
    isLimited: boolean;
  }
  
  // 글로벌 저장소 설정
  const globalForIPLimit = global as { ipLimitStore?: Map<string, LimitInfo> };
  if (!globalForIPLimit.ipLimitStore) {
    globalForIPLimit.ipLimitStore = new Map<string, LimitInfo>();
  }
  
  const ipLimitStore = globalForIPLimit.ipLimitStore;
  
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
  ): Promise<LimitCheckResult> => {
    const RATE_LIMIT_ENABLED = process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true';
    if (!RATE_LIMIT_ENABLED) return { success: true };
  
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
      ? Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10')
      : Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100');
  
    const count = searchType === 'single' 
      ? limitInfo.singleSearchCount 
      : limitInfo.bulkSearchCount;
  
    if (count >= limit) {
      return {
        success: false,
        message: `${searchType === 'single' ? '개별' : '벌크'} 검색 일일 한도를 초과했습니다.`
      };
    }
  
    if (searchType === 'single') {
      limitInfo.singleSearchCount++;
    } else {
      limitInfo.bulkSearchCount++;
    }
  
    ipLimitStore.set(ip, limitInfo);
    return { success: true };
  };
  
  export const getRemainingSearches = (request: Request): RemainingSearches => {
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
    const singleLimit = Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10');
    const bulkLimit = Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100');
  
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