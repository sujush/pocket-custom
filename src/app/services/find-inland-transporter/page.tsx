'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// CSV 각 행(Row)에 해당하는 데이터 구조를 정의합니다.
interface CSVRow {
  no: string;
  보세운송업자부호: string;
  보세운송업체명: string;
  영업소재지: string;
}

// 실제 화면에서 활용할 내륙운송사 데이터 구조입니다.
interface InlandTransporter {
  no: string;
  code: string;     // 보세운송업자부호
  name: string;     // 보세운송업체명
  address: string;  // 영업소재지
  city: string;     // 지역(시 단위 또는 '기타')
}

// 추천(특정) 운송사 데이터 구조 예시
interface RecommendedTransporter {
  id: number;
  name: string;       // 업체명
  address: string;    // 주소
  capability: string; // 핵심 역량
  contact: string;    // 연락처
}

const InlandTransporterFinder: React.FC = () => {
  const [transporters, setTransporters] = useState<InlandTransporter[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [cityList, setCityList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 추천(특정) 운송사 예시 데이터
  const recommendedTransporters: RecommendedTransporter[] = [
    {
      id: 1,
      name: '(주)대한로지스',
      address: '서울특별시 강남구 테헤란로 123',
      capability: '화물운송, 특수화물, 전국배송',
      contact: '02-1234-5678',
    },
    {
      id: 2,
      name: '(주)코리아트랜스',
      address: '부산광역시 중구 충장대로 456',
      capability: '컨테이너 운송, 항만하역',
      contact: '051-987-6543',
    },
  ];

  useEffect(() => {
    // CSV 파일 로딩 & 파싱
    const loadTransporterData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/inland-transporter-list.csv');
        const csvText = await response.text();

        Papa.parse<CSVRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData: InlandTransporter[] = results.data.map((row) => {
              // 주소에서 공백으로 나눠 첫 단어를 city로 사용.
              const splittedAddress = row.영업소재지?.split(' ') || [];
              // 공백 제거한 결과가 빈 문자열이면 "기타"로 처리
              const firstCityPart = splittedAddress[0]?.trim() || '';
              const cityCandidate = firstCityPart === '' ? '기타' : firstCityPart;

              return {
                no: row.no,
                code: row.보세운송업자부호,
                name: row.보세운송업체명,
                address: row.영업소재지,
                city: cityCandidate,
              };
            });

            setTransporters(parsedData);

            // 지역 목록 추출 (중복 제거)
            // "기타"도 포함하여 보여줄 수 있도록 필터링 최소화
            const cities = Array.from(new Set(parsedData.map(item => item.city)));
            setCityList(cities.sort());

            setLoading(false);
          },
          error: (error: Error) => {
            console.error('CSV 파싱 오류:', error);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setLoading(false);
      }
    };

    loadTransporterData();
  }, []);

  // 지역 선택 이벤트
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  // 검색어 입력 이벤트
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 운송사 네이버 검색
  const handleCheckInfo = (transporterName: string) => {
    const query = encodeURIComponent(transporterName);
    const naverSearchUrl = `https://search.naver.com/search.naver?query=${query}`;
    window.open(naverSearchUrl, '_blank');
  };

  // 지역 & 검색어에 따른 필터링
  const filteredTransporters = transporters.filter((t) => {
    const matchCity = selectedCity ? t.city === selectedCity : true;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(searchLower) ||
      t.code.toLowerCase().includes(searchLower) ||
      t.address.toLowerCase().includes(searchLower);

    return matchCity && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">내륙운송사 찾기</h1>

      {/* 추천(특정) 운송사 카드 섹션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">추천 내륙운송사</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedTransporters.map((trans) => (
            <div key={trans.id} className="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm">
              <h3 className="text-lg font-bold text-blue-800">{trans.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{trans.address}</p>
              <p className="mb-1"><span className="font-semibold">핵심 역량:</span> {trans.capability}</p>
              <p className="mb-1"><span className="font-semibold">연락처:</span> {trans.contact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 지역 선택 & 검색창 */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* 지역(시) 드롭다운 */}
        <div className="flex-1">
          <label htmlFor="citySelect" className="block mb-2 font-medium">
            지역(시)을 선택하세요:
          </label>
          <select
            id="citySelect"
            className="border p-2 w-full"
            value={selectedCity}
            onChange={handleCityChange}
          >
            <option value="">전체 지역</option>
            {cityList.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 검색창 */}
        <div className="flex-1">
          <label htmlFor="searchInput" className="block mb-2 font-medium">
            검색(운송사명, 부호, 주소):
          </label>
          <input
            id="searchInput"
            type="text"
            className="border p-2 w-full"
            placeholder="검색어를 입력하세요..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 로딩 상태 표시 */}
      {loading && (
        <p className="text-center text-gray-600 mt-4">데이터를 불러오는 중입니다...</p>
      )}

      {/* 필터링된 운송사 목록 */}
      {!loading && filteredTransporters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border text-left">No</th>
                <th className="py-2 px-4 border text-left">보세운송업자부호</th>
                <th className="py-2 px-4 border text-left">내륙운송사명</th>
                <th className="py-2 px-4 border text-left">영업소재지</th>
                <th className="py-2 px-4 border text-left">정보 확인</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransporters.map((t, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border">{t.no}</td>
                  <td className="py-2 px-4 border">{t.code}</td>
                  <td className="py-2 px-4 border">{t.name}</td>
                  <td className="py-2 px-4 border">{t.address}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleCheckInfo(t.name)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      운송사 정보 확인
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 mt-4">
            선택하신 조건에 해당하는 내륙운송사가 없습니다.
          </p>
        )
      )}
    </div>
  );
};

export default InlandTransporterFinder;
