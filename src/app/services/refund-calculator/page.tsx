// app/refund-calculator/page.tsx
'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function RefundCalculatorPage() {
  const [hsCode, setHsCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refundData, setRefundData] = useState<SimlXamrttXtrnUserQryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateHsCode = (code: string): boolean => {
    return /^\d{10}$/.test(code);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setRefundData(null);

    if (!validateHsCode(hsCode)) {
      setError('HS코드는 10자리 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/refund-calculator?hsCode=${hsCode}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '조회에 실패했습니다.');
      }
      const data: SimlXamrttXtrnUserQryResponse = await res.json();
      setRefundData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (date: string): string => {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>간이정액 환급액 조회</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="HS코드 10자리 입력 (예: 0101210000)"
                maxLength={10}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '조회중...' : '조회'}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {refundData?.simlXamrttXtrnUserQryRtnVo && (
              <div className="mt-6 space-y-4">
                {refundData.simlXamrttXtrnUserQryRtnVo.map((result, index) =>
                  result.simlXamrttXtrnUserQryRsltVo?.map((item, idx) => (
                    <Card key={`${index}-${idx}`} className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">품목명</p>
                          <p>{item.stsz?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">HS Code</p>
                          <p>{item.hs10?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">단위당 환급금액</p>
                          <p>{item.prutDrwbWncrAmt?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">적용일자</p>
                          <p>{item.aplyDd?.[0] ? formatDate(item.aplyDd[0]) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">중지일자</p>
                          <p>{item.ceseDt?.[0] ? formatDate(item.ceseDt[0]) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">환급액계기준구분</p>
                          <p>{item.drwbAmtBaseTpcd?.[0] === '1' ? '10%당 환급액' : 'N/A'}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}