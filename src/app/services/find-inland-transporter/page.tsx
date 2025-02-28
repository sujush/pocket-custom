'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// CSV 각 행(Row)에 해당하는 데이터 구조를 정의합니다.
// CSV 파일이 다음과 같은 헤더를 가졌다고 가정합니다:
// no, 보세운송업자부호, 보세운송업체명, 영업소재지
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
  city: string;     // 지역(시 단위로 추출하여 저장)
}

const InlandTransporterFinder: React.FC = () => {
  // 전체 내륙운송사 리스트
  const [transporters, setTransporters] = useState<InlandTransporter[]>([]);
  // 선택된 지역
  const [selectedCity, setSelectedCity] = useState<string>('');
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);
  // 지역 목록 (중복 제거)
  const [cityList, setCityList] = useState<string[]>([]);

  useEffect(() => {
    // CSV 파일을 로딩하고 파싱하는 함수
    const loadTransporterData = async () => {
      try {
        setLoading(true);

        // public 폴더 아래 data 폴더에 csv 파일이 있다고 가정합니다.
        // e.g. public/data/inland-transporter-list.csv
        const response = await fetch('/data/inland-transporter-list.csv');
        const csvText = await response.text();

        Papa.parse<CSVRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // CSV 파싱이 완료되면 results.data 로 데이터를 가져올 수 있습니다.
            const parsedData: InlandTransporter[] = results.data.map((row) => {
              // 시 단위(예: "서울특별시", "부산광역시", "경기도", ...)를 주소에서 추출하는 로직
              // 가장 간단하게는 공백으로 잘라 첫 번째 단어를 city로 간주합니다.
              // (데이터 구조에 따라 적절히 로직을 수정하세요)
              const splittedAddress = row.영업소재지?.split(' ') || [];
              const cityCandidate = splittedAddress.length > 0 ? splittedAddress[0] : '주소 정보 없음';

              return {
                no: row.no,
                code: row.보세운송업자부호,
                name: row.보세운송업체명,
                address: row.영업소재지,
                city: cityCandidate,
              };
            });

            setTransporters(parsedData);

            // 지역 목록 추출(중복 제거)
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

  // 선택된 지역에 맞춰 필터링된 내륙운송사 목록
  const filteredTransporters = transporters.filter(
    (t) => !selectedCity || t.city === selectedCity
  );

  // 지역 선택 시 상태 업데이트
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  // "운송사 정보 확인" 버튼을 눌렀을 때 네이버 검색으로 이동하는 함수
  const handleCheckInfo = (transporterName: string) => {
    const query = encodeURIComponent(transporterName);
    const naverSearchUrl = `https://search.naver.com/search.naver?query=${query}`;
    window.open(naverSearchUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">내륙운송사 찾기</h1>

      {/* 지역 선택 드롭다운 */}
      <div className="mb-4">
        <label htmlFor="citySelect" className="block mb-2 font-medium">
          지역(시)을 선택하세요:
        </label>
        <select
          id="citySelect"
          className="border p-2"
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

      {/* 데이터 로딩 상태 */}
      {loading && (
        <p className="text-center text-gray-600 mt-4">데이터를 불러오는 중입니다...</p>
      )}

      {/* 필터링된 내륙운송사 목록 */}
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
            선택하신 지역에 해당하는 내륙운송사가 없습니다.
          </p>
        )
      )}
    </div>
  );
};

export default InlandTransporterFinder;
