"use client";

import { useState, useEffect, type FC, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

interface ExchangeRate {
  country: string;
  code: string;
  rate: number;
  currency: string;
}

const Hero: FC = () => {
  // ==========================
  // = 기존 상태와 로직들 =
  // ==========================
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
  const [weekRange, setWeekRange] = useState<string>("");

  // 주간 범위 계산 함수
  const calculateWeekRange = (date: Date): string => {
    const curr = new Date(date);
    const sunday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    const saturday = new Date(curr.setDate(curr.getDate() + 6));
    
    const formatDate = (d: Date): string => {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${month}.${day}`;
    };

    return `${formatDate(sunday)}~${formatDate(saturday)}`;
  };

  // XML 파싱 함수
  const parseExchangeRates = useCallback((xmlText: string): ExchangeRate[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const rateElements = xmlDoc.getElementsByTagName("trifFxrtInfoQryRsltVo");
    
    const countryMapping: { [key: string]: ExchangeRate } = {
      US: { country: '미국', code: 'USD', rate: 0, currency: 'Dollar' },
      CN: { country: '중국', code: 'CNY', rate: 0, currency: 'Yuan' },
      JP: { country: '일본', code: 'JPY', rate: 0, currency: 'Yen' },
      EU: { country: '유럽', code: 'EUR', rate: 0, currency: 'Euro' },
      GB: { country: '영국', code: 'GBP', rate: 0, currency: 'Pound' }
    };
  
    Array.from(rateElements).forEach((rateElement: Element) => {
      const countryCode = rateElement.getElementsByTagName("cntySgn")[0]?.textContent || '';
      const rateValue = rateElement.getElementsByTagName("fxrt")[0]?.textContent || '0';
      
      // 우리가 관심 있는 국가의 환율만 업데이트
      Object.entries(countryMapping).forEach(([key, data]) => {
        if (countryCode.includes(key)) {
          data.rate = parseFloat(rateValue);
        }
      });
    });
  
    return Object.values(countryMapping);
  }, []);

  // 환율 데이터 가져오기
  useEffect(() => {
    const fetchExchangeRates = async (): Promise<void> => {
      try {
        const response = await fetch('/api/exchange-rates');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '환율 정보를 가져오는데 실패했습니다');
        }

        const xmlText = await response.text();
        console.log('Response XML:', xmlText.substring(0, 200));

        const updatedRates = parseExchangeRates(xmlText);
        console.log('Parsed rates:', updatedRates);

        setExchangeRates(updatedRates);
        setError(null);
        setWeekRange(calculateWeekRange(new Date()));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '환율 정보를 불러올 수 없습니다';
        console.error('Fetch error details:', {
          message: errorMessage,
          error: err
        });
        setError(errorMessage);
      }
    };

    fetchExchangeRates();
  }, [parseExchangeRates]);

  // 시간 업데이트 (1초 간격)
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

  // 날짜/시간 포맷
  const days = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const formattedDate = `${currentTime.getFullYear()}년 ${currentTime.getMonth() + 1}월 ${currentTime.getDate()}일 ${days[currentTime.getDay()]}요일`;
  const formattedTime = currentTime.toLocaleTimeString('ko-KR');

  // 현재 표시할 환율
  const currentRate = exchangeRates[currentRateIndex];

  // ========================================
  // = 최종 return: order-* 클래스로 순서 조정 =
  // ========================================
  return (
    <div className="block md:flex md:justify-between items-center px-4 md:px-8 mb-8 md:mb-16">
      
      {/* 
        (1) 모바일 기준: "모바일 안내 문구" -> order-1
            데스크탑(md 이상): "현재 시각"의 순서가 우선이므로 order-2
      */}
      <div className="order-1 md:order-2 text-center mb-4 md:mb-0">
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-600 mb-4">
          포켓 커스텀
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4 md:mb-8">
          통관 및 물류 정보를 한 눈에 확인하세요
        </p>
      </div>

      {/* 
        (2) 모바일 기준: "현재 시각" -> order-2
            데스크탑: order-1  (즉, 데스크톱에서 먼저 보이도록)
      */}
      <div className="order-2 md:order-1 w-full md:w-64 mb-4 md:mb-0">
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

      {/* 
        (3) 모바일 기준: "주간 환율" -> order-3 (마지막)
            데스크탑: order-3 (마지막)
      */}
      <div className="order-3 w-full md:w-64">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">
            주간 관세환율 [{weekRange}]
          </span>
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
