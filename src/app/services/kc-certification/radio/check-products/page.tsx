"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type ProductRow = {
  상호: string;
  기자재명칭: string;
  모델명: string;
  제조국가: string;
  인증연월일: string;
  인증상태: string;
  인증번호: string;
};

export default function CheckProductsPage() {
  const [allData, setAllData] = useState<ProductRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1) 페이지가 로드되면, CSV->JSON 변환된 데이터를 API로부터 가져온다
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/device-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAllData(json.data);
        }
      })
      .catch((error) => {
        console.error("데이터 로딩 중 오류 발생:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2) 검색 로직
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText) {
      // 검색어가 없으면 빈 배열로 유지
      setFilteredData([]);
      return;
    }
    // 검색어가 있으면 allData에서 필터
    const result = allData.filter((row) =>
      row["기자재명칭"]?.includes(searchText) ||
      row["모델명"]?.includes(searchText) ||
      row["상호"]?.includes(searchText) ||
      row["제조국가"]?.includes(searchText)
    );
    setFilteredData(result);
  };

  // 모바일에서 표시할 카드 컴포넌트
  const ProductCard = ({ product }: { product: ProductRow }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{product["상호"]}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium 
          ${product["인증상태"]?.includes("유효") ? "bg-green-100 text-green-800" : 
            product["인증상태"]?.includes("만료") ? "bg-red-100 text-red-800" : 
            "bg-gray-100 text-gray-800"}`}>
          {product["인증상태"]}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-3 gap-1">
          <span className="text-gray-600 font-medium">기자재명칭:</span>
          <span className="col-span-2 break-words">{product["기자재명칭"]}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-gray-600 font-medium">모델명:</span>
          <span className="col-span-2 break-words">{product["모델명"]}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-gray-600 font-medium">제조국가:</span>
          <span className="col-span-2">{product["제조국가"]}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-gray-600 font-medium">인증연월일:</span>
          <span className="col-span-2">{product["인증연월일"]}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-gray-600 font-medium">인증번호:</span>
          <span className="col-span-2">{product["인증번호"]}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl mb-6 font-bold text-gray-900">인증제품 확인</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              type="text"
              placeholder="기자재명칭, 모델명, 상호, 제조국가 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors sm:w-auto w-full"
            type="submit"
          >
            검색
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {/* 모바일 화면에서는 카드 형태로 표시 */}
          <div className="md:hidden">
            {filteredData.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">검색 결과: {filteredData.length}건</p>
                {filteredData.map((product, idx) => (
                  <ProductCard key={idx} product={product} />
                ))}
              </div>
            ) : searchText ? (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">다른 검색어로 시도해보세요.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <p className="text-gray-500">검색어를 입력하고 검색 버튼을 클릭하세요.</p>
              </div>
            )}
          </div>

          {/* 데스크탑 화면에서는 테이블 형태로 표시 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">상호</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">기자재명칭</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">모델명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">제조국가</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">인증연월일</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">인증상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">인증번호</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm border-r">{row["상호"]}</td>
                      <td className="px-4 py-3 text-sm border-r">{row["기자재명칭"]}</td>
                      <td className="px-4 py-3 text-sm border-r">{row["모델명"]}</td>
                      <td className="px-4 py-3 text-sm border-r">{row["제조국가"]}</td>
                      <td className="px-4 py-3 text-sm border-r">{row["인증연월일"]}</td>
                      <td className="px-4 py-3 text-sm border-r">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium 
                          ${row["인증상태"]?.includes("유효") ? "bg-green-100 text-green-800" : 
                            row["인증상태"]?.includes("만료") ? "bg-red-100 text-red-800" : 
                            "bg-gray-100 text-gray-800"}`}>
                          {row["인증상태"]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{row["인증번호"]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchText ? "검색 결과가 없습니다." : "검색어를 입력하고 검색 버튼을 클릭하세요."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}