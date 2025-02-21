'use client';

import { useState, useEffect, type FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sun, Moon } from "lucide-react";

interface ExchangeRate {
  country: string;
  code: string;
  rate: number;
  currency: string;
}

const Hero: FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentRateIndex, setCurrentRateIndex] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { country: '미국', code: 'USD', rate: 0, currency: 'Dollar' },
    { country: '중국', code: 'CNY', rate: 0, currency: 'Yuan' },
    { country: '일본', code: 'JPY', rate: 0, currency: 'Yen' },
    { country: '유럽', code: 'EUR', rate: 0, currency: 'Euro' },
    { country: '영국', code: 'GBP', rate: 0, currency: 'Pound' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState<string>('');

  // 주간 범위 계산 함수
  const calculateWeekRange = (date: Date): string => {
    const curr = new Date(date);
    const sunday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    const saturday = new Date(curr.setDate(curr.getDate() + 6));
    
    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}.${day}`;
    };

    return `${formatDate(sunday)}~${formatDate(saturday)}`;
  };

  // XML 파싱 함수
  const parseExchangeRates = (xmlText: string): ExchangeRate[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const rateElements = xmlDoc.getElementsByTagName("trifFxrtInfoQryRsltVo");
    
    const newRates = [...exchangeRates];
    
    Array.from(rateElements).forEach((rateElement: Element) => {
      const getElementText = (tagName: string): string => {
        const element = rateElement.getElementsByTagName(tagName)[0];
        return element ? element.textContent || '' : '';
      };

      const countryCode = getElementText("cntySign");
      const rateValue = getElementText("fxrt");
      
      const existingRateIndex = newRates.findIndex(r => r.code === countryCode);
      if (existingRateIndex !== -1 && rateValue) {
        newRates[existingRateIndex].rate = parseFloat(rateValue);
      }
    });
    
    return newRates;
  };

  // 환율 데이터 가져오기
  useEffect(() => {
    const fetchExchangeRates = async (): Promise<void> => {
      try {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const API_KEY = process.env.NEXT_PUBLIC_TARIFF_RATE;
        
        if (!API_KEY) {
          throw new Error('API 키가 설정되지 않았습니다');
        }
        
        const response = await fetch(
          `https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo?crkyCn=${API_KEY}&qryYymmDd=${today}&imexTp=2`
        );

        if (!response.ok) {
          throw new Error('환율 정보를 가져오는데 실패했습니다');
        }

        const xmlText = await response.text();
        const updatedRates = parseExchangeRates(xmlText);
        setExchangeRates(updatedRates);
        setError(null);
        
        // 주간 범위 설정
        setWeekRange(calculateWeekRange(new Date()));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '환율 정보를 불러올 수 없습니다';
        console.error('환율 데이터 조회 실패:', errorMessage);
        setError(errorMessage);
      }
    };

    fetchExchangeRates();
  }, [parseExchangeRates]);

  // 시간 업데이트 로직
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 환율 순환 로직
  useEffect(() => {
    const rotationTimer = setInterval(() => {
      setCurrentRateIndex((prevIndex) => (prevIndex + 1) % exchangeRates.length);
    }, 2000);

    return () => clearInterval(rotationTimer);
  }, [exchangeRates.length]);

  // 시간에 따른 아이콘 결정
  const hour = currentTime.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  // 날짜 포맷팅
  const days = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const formattedDate = `${currentTime.getFullYear()}년 ${currentTime.getMonth() + 1}월 ${currentTime.getDate()}일 ${days[currentTime.getDay()]}요일`;
  const formattedTime = currentTime.toLocaleTimeString('ko-KR');

  // 현재 표시할 환율
  const currentRate = exchangeRates[currentRateIndex];

  return (
    <div className="flex justify-between items-center px-8 mb-16">
      {/* 왼쪽 날짜/시간 위젯 */}
      <div className="w-64">
        <div className="flex items-center gap-2 mb-2">
          {isDaytime ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-blue-500" />
          )}
          <span className="font-semibold">현재 시각</span>
        </div>
        <div className="text-sm">
          <div className="text-gray-600">{formattedDate}</div>
          <div className="text-2xl font-bold text-gray-800">{formattedTime}</div>
        </div>
      </div>

      {/* 중앙 로고 및 제목 */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Avatar className="h-24 w-24 mr-4">
            <AvatarImage src="/eyeon_logo.png" alt="eyeon_logo" />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <h1 className="text-5xl font-bold text-indigo-600">이연 관세사무소</h1>
        </div>
        <p className="text-xl text-gray-700 mb-8">
          모바일은 데스크탑 모드를 이용해주세요.
        </p>
      </div>

      {/* 오른쪽 환율 위젯 */}
      <div className="w-64">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">주간 관세환율 [{weekRange}]</span>
        </div>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {currentRate.country} ({currentRate.code})
            </span>
            <span className="text-2xl font-bold text-gray-800">
              {currentRate.rate.toLocaleString('ko-KR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;