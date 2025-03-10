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
    simlXamrttXtrnUserQryRsltVo?: Array<{
      prutDrwbWncrAmt?: string[]; // 단위당 환급금액
      drwbAmtBaseTpcd?: string[]; // 1: 10$당, 2: 1만원당
      // 필요 없다 하셨으니 stsz, hs10, 등은 생략 가능
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

  /**
   * FOB 금액(fobValue)을 기반으로,
   * 관세청 API 응답 refundData의 모든 항목을 순회하며
   * drwbAmtBaseTpcd가 '2' 또는 '' 인 경우 환급액을 누적하여 합산.
   * 
   * 환급액 공식:
   *   총 환급액 += (FOB × 단위당 환급금액) / 10000
   */
  function getTotalRefund(refundData: SimlXamrttXtrnUserQryResponse | null, fobValue: string): number {
    // 1. 유효성 체크
    if (!refundData?.simlXamrttXtrnUserQryRtnVo?.simlXamrttXtrnUserQryRsltVo) {
      return 0;
    }

    // 2. FOB 금액 숫자로 변환
    const fob = Number(fobValue);
    if (isNaN(fob) || fob < 0) {
      return 0;
    }

    // 3. 환급액 누적 합산
    let total = 0;
    refundData.simlXamrttXtrnUserQryRtnVo.simlXamrttXtrnUserQryRsltVo.forEach((item) => {
      const baseTpcd = item.drwbAmtBaseTpcd?.[0] ?? '';
      const prutAmt = item.prutDrwbWncrAmt?.[0] ?? '';
      // 빈 문자열('')도 '2'처럼 간주하여 계산
      if ((baseTpcd === '2' || baseTpcd === '') && prutAmt) {
        const prut = Number(prutAmt);
        if (!isNaN(prut)) {
          total += (fob * prut) / 10000;
        }
      }
    });

    return total;
  }

  // 화면에 표시할 환급액 (정수 반올림 or 내림)
  const totalRefund = Math.floor(getTotalRefund(refundData, fobValue));

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>간이정액 환급액 조회 (FOB 금액 계산)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 입력 영역 */}
            <div className="flex flex-col gap-4">
              {/* HS Code 입력 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="HS코드 10자리 입력"
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
                  placeholder="FOB 금액(원화)"
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

            {/* 결과 표시 (총 환급액) */}
            {refundData && (
              <div className="mt-6">
                <p className="text-xl font-semibold">
                  2025년 기준 총 환급액 : <span className="font-bold">{totalRefund.toLocaleString()} 원</span>
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
