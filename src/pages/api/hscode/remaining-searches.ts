// pages/api/hscode/remaining-searches.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getRemainingSearches } from '@/lib/utils/rateLimit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const remaining = getRemainingSearches(req);
    return res.status(200).json(remaining);
  } catch (error) {
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}