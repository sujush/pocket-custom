'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 실제 XML 구조에 맞춰 인터페이스 수정
 * - simlXamrttXtrnUserQryRtnVo: "객체"
 * - 그 내부의 simlXamrttXtrnUserQryRsltVo: "배열"
 */
interface SimlXamrttXtrnUserQryResponse {
  simlXamrttXtrnUserQryRtnVo?: {
    ntceInfo?: string[];
    tCnt?: string[];
    simlXamrttXtrnUserQryRsltVo?: Array<{
      prutDrwbWncrAmt?: string[]; // 단위당 환급금액
      stsz?: string[];            // 품목명
      hs10?: string[];            // HS 10자리 코드
      aplyDd?: string[];          // 적용일자
      ceseDt?: string[];          // 중지일자
      drwbAmtBaseTpcd?: string[]; // 환급액계기준구분코드 (1: 10$당 환급액, 2: 1만원당 환급액)
    }>;
  };
}

export default function RefundCalculatorPage() {
  // HS Code 입력 상태
  const [hsCode, setHsCode] = useState<string>('');
  // FOB 금액(원화) 입력 상태
  const [fobValue, setFobValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refundData, setRefundData] = useState<SimlXamrttXtrnUserQryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // HS Code 10자리 검증
  const validateHsCode = (code: string): boolean => {
    return /^\d{10}$/.test(code);
  };

  // 폼 submit 처리
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setRefundData(null);

    // HS Code 유효성 체크
    if (!validateHsCode(hsCode)) {
      setError('HS코드는 10자리 숫자여야 합니다.');
      return;
    }

    // FOB 금액이 숫자인지 체크
    const fobNum = Number(fobValue);
    if (isNaN(fobNum) || fobNum < 0) {
      setError('FOB 금액은 0 이상의 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // API 호출
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

  // 날짜 포맷팅
  const formatDate = (date: string): string => {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  };

  // drwbAmtBaseTpcd === '2' (1만원당 환급액) 인 경우, 환급액 계산
  // 환급액(원) = FOB금액 × (단위당 환급금액 / 10000)
  const calculateRefund = (baseTpcd?: string, prutAmt?: string): number | null => {
    if (baseTpcd === '2' && prutAmt) {
      const prut = Number(prutAmt);
      const fob = Number(fobValue);
      if (!isNaN(prut) && !isNaN(fob)) {
        return (fob * prut) / 10000;
      }
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>간이정액 환급액 조회 (FOB 금액 계산)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 영역 */}
            <div className="flex flex-col gap-4">
              {/* HS Code 입력 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="HS코드 10자리 입력 (예: 0101210000)"
                  maxLength={10}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    window.open('https://pocket-custom.vercel.app/services/hscode', '_blank')
                  }
                >
                  HS CODE 확인하기
                </Button>
              </div>

              {/* FOB 금액(원화) 입력 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={fobValue}
                  onChange={(e) => setFobValue(e.target.value)}
                  placeholder="FOB 금액(원화)을 입력하세요 (예: 100000)"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 조회 버튼 */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '조회중...' : '조회'}
              </Button>
            </div>

            {/* 에러 표시 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 결과 표시 */}
            {refundData?.simlXamrttXtrnUserQryRtnVo?.simlXamrttXtrnUserQryRsltVo && (
              <div className="mt-6 space-y-4">
                {refundData.simlXamrttXtrnUserQryRtnVo.simlXamrttXtrnUserQryRsltVo.map((item, idx) => {
                  const drwbAmtBaseTpcd = item.drwbAmtBaseTpcd?.[0];
                  const prutAmt = item.prutDrwbWncrAmt?.[0];
                  const refundAmount = calculateRefund(drwbAmtBaseTpcd, prutAmt);

                  return (
                    <Card key={idx} className="p-4 space-y-2">
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
                          <p>{prutAmt || 'N/A'}</p>
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
                          <p className="text-sm font-medium text-gray-500">환급액기준구분</p>
                          <p>
                            {drwbAmtBaseTpcd === '1'
                              ? '10$당 환급액'
                              : drwbAmtBaseTpcd === '2'
                              ? '1만원당 환급액'
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* drwbAmtBaseTpcd가 '2'인 경우에만 계산 결과 표시 */}
                      {refundAmount !== null && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">계산된 환급액(원)</p>
                          <p className="text-lg font-semibold">
                            {Math.floor(refundAmount).toLocaleString()} 원
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
