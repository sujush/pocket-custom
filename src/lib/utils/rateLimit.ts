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

const updateIPLimitInfo = async (ip: string, limitInfo: LimitInfo): Promise<void> => {
  console.log('Updating IP limit info:', { ip, ...limitInfo });
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
  console.log('Checking IP limit for search type:', searchType);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  console.log('Request IP:', ip);
  
  const today = new Date().toISOString().split('T')[0];
  console.log('Today:', today);
  
  const limitInfo = (await getIPLimitInfo(ip)) || {
    singleSearchCount: 0,
    bulkSearchCount: 0,
    lastReset: today,
  };
  console.log('Current limit info:', limitInfo);

  if (limitInfo.lastReset !== today) {
    console.log('Resetting counts for new day');
    limitInfo.singleSearchCount = 0;
    limitInfo.bulkSearchCount = 0;
    limitInfo.lastReset = today;
  }

  const limit = searchType === 'single'
    ? Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10')
    : Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100');
  console.log(`${searchType} search limit:`, limit);

  const count = searchType === 'single'
    ? limitInfo.singleSearchCount
    : limitInfo.bulkSearchCount;
  console.log(`Current ${searchType} search count:`, count);

  if (count >= limit) {
    console.log(`${searchType} search limit exceeded`);
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
  console.log('Updated limit info:', limitInfo);

  await updateIPLimitInfo(ip, limitInfo);
  return { success: true };
};

// 남은 검색 횟수 반환
export const getRemainingSearches = async (request: Request): Promise<RemainingSearches> => {
  try {
    console.log('Getting remaining searches...');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    console.log('Client IP:', ip);

    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);

    console.log('Attempting to fetch IP limit info from DynamoDB...');
    const limitInfo = (await getIPLimitInfo(ip)) || {
      singleSearchCount: 0,
      bulkSearchCount: 0,
      lastReset: today,
    };
    console.log('DynamoDB response:', JSON.stringify(limitInfo, null, 2));

    console.log('IP limit info:', limitInfo);

    console.log('Environment variables:', {
      singleLimit: process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT,
      bulkLimit: process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT
    });

    if (limitInfo.lastReset !== today) {
      console.log('Resetting search counts for new day');
      return { 
        single: Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10'), 
        bulk: Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100'), 
        isLimited: true 
      };
    }

    console.log(`Current single search count: ${limitInfo.singleSearchCount}`);
    console.log(`Current bulk search count: ${limitInfo.bulkSearchCount}`);

    const singleLimit = Number(process.env.NEXT_PUBLIC_SINGLE_SEARCH_DAILY_LIMIT || '10');
    const bulkLimit = Number(process.env.NEXT_PUBLIC_BULK_SEARCH_DAILY_LIMIT || '100');

    return {
      single: Math.max(0, singleLimit - limitInfo.singleSearchCount),
      bulk: Math.max(0, bulkLimit - limitInfo.bulkSearchCount),
      isLimited: true,
    };
  } catch (error) {
    console.error('Error getting remaining searches:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};