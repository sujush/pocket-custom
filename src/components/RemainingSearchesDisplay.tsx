// src/components/RemainingSearchesDisplay.tsx
import { FC } from 'react';
import { RemainingSearches } from '@/types/rateLimit';

interface RemainingSearchesDisplayProps {
  remaining: RemainingSearches;
}

export const RemainingSearchesDisplay: FC<RemainingSearchesDisplayProps> = ({ 
  remaining 
}) => {
  if (!remaining.isLimited) return null;

  return (
    <div className="mb-4 p-2 bg-blue-50 rounded">
      <p className="font-semibold">남은 검색 횟수:</p>
      <p>개별 검색: {remaining.single === Infinity ? '무제한' : `${remaining.single}회`}</p>
      <p>벌크 검색: {remaining.bulk === Infinity ? '무제한' : `${remaining.bulk}회`}</p>
    </div>
  );
};