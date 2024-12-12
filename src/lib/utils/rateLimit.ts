// src/lib/utils/rateLimit.ts
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// DynamoDB 테이블 이름
const TABLE_NAME = 'IPLimitStore';

interface LimitInfo {
  singleSearchCount: number;
  bulkSearchCount: number;
  lastReset: string; // DynamoDB는 ISO 형식의 문자열로 날짜를 저장
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

// DynamoDB에서 IP 정보 조회
const getIPLimitInfo = async (ip: string): Promise<LimitInfo | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { ip },
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item as LimitInfo | null;
};

// DynamoDB에 IP 정보 저장
const updateIPLimitInfo = async (ip: string, limitInfo: LimitInfo): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Item: { ip, ...limitInfo },
  };
  await dynamoDB.put(params).promise();
};

// 검색 한도 확인
export const checkIPLimit = async (
  request: Request,
  searchType: 'single' | 'bulk',
): Promise<LimitCheckResult> => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const today = new Date().toISOString().split('T')[0]; // 날짜만 비교
  const limitInfo = (await getIPLimitInfo(ip)) || {
    singleSearchCount: 0,
    bulkSearchCount: 0,
    lastReset: today,
  };

  if (limitInfo.lastReset !== today) {
    // 날짜가 변경된 경우 초기화
    limitInfo.singleSearchCount = 0;
    limitInfo.bulkSearchCount = 0;
    limitInfo.lastReset = today;
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
      message: `${searchType === 'single' ? '개별' : '벌크'} 검색 일일 한도를 초과했습니다.`,
    };
  }

  if (searchType === 'single') {
    limitInfo.singleSearchCount++;
  } else {
    limitInfo.bulkSearchCount++;
  }

  await updateIPLimitInfo(ip, limitInfo);
  return { success: true };
};

// 남은 검색 횟수 반환
export const getRemainingSearches = async (request: Request): Promise<RemainingSearches> => {
  try {
    console.log('Getting remaining searches...');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    const limitInfo = (await getIPLimitInfo(ip)) || {
      singleSearchCount: 0,
      bulkSearchCount: 0,
      lastReset: today,
    };

    const singleLimit = Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10');
    const bulkLimit = Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100');

    if (limitInfo.lastReset !== today) {
      console.log('Resetting search counts for new day');
      return { single: singleLimit, bulk: bulkLimit, isLimited: true };
    }

    console.log(`Current single search count: ${limitInfo.singleSearchCount}`);
    console.log(`Current bulk search count: ${limitInfo.bulkSearchCount}`);

    return {
      single: Math.max(0, singleLimit - limitInfo.singleSearchCount),
      bulk: Math.max(0, bulkLimit - limitInfo.bulkSearchCount),
      isLimited: true,
    };
  } catch (error) {
    console.error('Error getting remaining searches:', error);
    throw error;
  }
};
