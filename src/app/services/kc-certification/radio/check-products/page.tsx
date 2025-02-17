"use client";

import { useEffect, useState } from "react";

type ProductRow = {
  날짜: string;
  구분: string;
  기자재명칭: string;
  모델명: string;
  상호: string;
  제조국가: string;
  인증번호: string;
};

export default function CheckProductsPage() {
  const [allData, setAllData] = useState<ProductRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<ProductRow[]>([]);

  // 1) 페이지가 로드되면, CSV->JSON 변환된 데이터를 API로부터 가져온다
  useEffect(() => {
    fetch("/api/device-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAllData(json.data);
          setFilteredData(json.data);
        }
      });
  }, []);

  // 2) 검색 로직
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText) {
      // 검색어가 없으면 전체 목록
      setFilteredData(allData);
      return;
    }
    // 컬럼 여러 개에서 검색: 기자재명칭, 모델명, 상호 등
    const result = allData.filter((row) =>
      row["기자재명칭"]?.includes(searchText) ||
      row["모델명"]?.includes(searchText) ||
      row["상호"]?.includes(searchText)
    );
    setFilteredData(result);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4 font-bold">인증제품 확인</h2>

      <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
        <input
          className="border p-2 flex-1"
          type="text"
          placeholder="제품명, 모델명, 상호 등 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          검색
        </button>
      </form>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">날짜</th>
            <th className="border px-2 py-1">구분</th>
            <th className="border px-2 py-1">기자재명칭</th>
            <th className="border px-2 py-1">모델명</th>
            <th className="border px-2 py-1">상호</th>
            <th className="border px-2 py-1">제조국가</th>
            <th className="border px-2 py-1">인증번호</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{row["날짜"]}</td>
                <td className="border px-2 py-1">{row["구분"]}</td>
                <td className="border px-2 py-1">{row["기자재명칭"]}</td>
                <td className="border px-2 py-1">{row["모델명"]}</td>
                <td className="border px-2 py-1">{row["상호"]}</td>
                <td className="border px-2 py-1">{row["제조국가"]}</td>
                <td className="border px-2 py-1">{row["인증번호"]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="border px-2 py-4 text-center">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
