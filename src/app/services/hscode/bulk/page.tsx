'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader } from 'lucide-react';
import { RemainingSearchesDisplay } from '@/components/RemainingSearchesDisplay';
import { useEffect } from 'react';
import { useRemainingSearches } from '@/app/RemainingSearchesContext';

// 재질 코드 매핑 상수
const MATERIAL_CODES = {
  'P': '플라스틱제',
  'R': '고무제',
  'C': '도자제',
  'G': '유리제',
  'T': '방직용 섬유제',
  'L': '가죽제',
  'M': '금속제',
  'PA': '종이제',
  'W': '나무제',
  'N': '모르거나 해당사항 없음'
} as const;

// 코드로 재질명 얻기
const getMaterialNameByCode = (code: string): string => {
  return MATERIAL_CODES[code as keyof typeof MATERIAL_CODES] || '모르거나 해당사항 없음';
};

// fetchWithTimeout 함수
const fetchWithTimeout = async (url: string, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// 타입 정의
type Item = {
  name: string;
  hscode: string;
};

type UploadedProduct = {
  name: string;
  material: string;
  description: string;
};

interface GroupedItem {
  name: string;
  hscode: string;
  description: string;
}

interface InitialResult {
  name: string;
  hscode: string;
}

interface ProcessedResult {
  title: string;
  items: GroupedItem[];
}

interface HSCodeItem {
  HS부호: number;
  적용시작일자: string;
  적용종료일자: string;
  한글품목명: string;
  영문품목명: string;
  한국표준무역분류명: string;
  수량단위최대단가: number;
  중량단위최대단가: number;
  수량단위코드: string;
  중량단위코드: string;
  수출성질코드: string;
  수입성질코드: string;
  품목규격명: string;
  필수규격명: string;
  참고규격명: string;
  규격설명: string;
  규격사항내용: string;
  성질통합분류코드: number;
  성질통합분류코드명: string;
}

interface APIResponse {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: HSCodeItem[];
}

type Result = InitialResult | ProcessedResult;

const LoadingStatus: React.FC<{ isLoading: boolean; status: string }> = ({ isLoading, status }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader className="animate-spin h-8 w-8 text-blue-500 mb-4" />
        <p className="text-lg font-semibold text-gray-700">{status}</p>
      </div>
    </div>
  );
};

const BulkHSCodePage = () => {
  const [products, setProducts] = useState<UploadedProduct[]>([{ name: '', material: '', description: '' }]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStatus, setQueryStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item }>({});
  const [expandedResults, setExpandedResults] = useState<{ [key: string]: boolean }>({});
  const { remainingSearches, setRemainingSearches } = useRemainingSearches();

  

  const MAX_PRODUCTS_LIMIT = 20;

  const toggleExpand = (productName: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [productName]: !prev[productName],
    }));
  };

  const handleItemSelect = (groupSixDigitCode: string, item: Item) => {
    setSelectedItems(prev => ({
      ...prev,
      [groupSixDigitCode]: item
    }));
  };

  const handleItemDeselect = (groupSixDigitCode: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[groupSixDigitCode];
      return newItems;
    });
  };

  const validateProducts = () => {
    for (const product of products) {
      if (!product.name.trim()) {
        alert('제품명을 입력해주세요.');
        return false;
      }
      if (!product.material) {
        alert('재질을 선택해주세요.');
        return false;
      }
    }
    return true;
  };

  const addProduct = () => {
    if (products.length < MAX_PRODUCTS_LIMIT) {
      setProducts([...products, { name: '', material: '', description: '' }]);
    } else {
      alert(`최대 ${MAX_PRODUCTS_LIMIT}의 제품만 추가할 수 있습니다.`);
    }
  };

  const handleProductChange = (index: number, field: keyof UploadedProduct, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      const data = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json: Array<{ [key: string]: string }> = XLSX.utils.sheet_to_json(sheet);

      const uploadedProducts: UploadedProduct[] = json.map((row) => ({
        name: row["제품명"] || '',
        material: getMaterialNameByCode(row["재질코드"] || 'N'),
        description: row["기타"] || '',
      }));

      setProducts(uploadedProducts);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        '제품명': '',
        '재질코드': '',
        '기타': '',
      },
      // ... 기존 샘플 데이터 유지
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    const columnWidths = [
      { wch: 30 },  // 제품명
      { wch: 15 },  // 재질코드
      { wch: 40 },  // 기타
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, '입력양식');
    XLSX.writeFile(workbook, 'HS_CODE_조회_양식.xlsx');
  };

  const downloadSelectedItems = () => {
    const excelData = Object.entries(selectedItems).map(([, item]) => ({
      '제품명': item.name,
      'HS CODE': item.hscode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const columnWidths = [
      { wch: 30 },
      { wch: 15 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected HS CODE Results');

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Selected_HSCode_Results_${currentDate}.xlsx`);
  };

  const fetchRemainingSearches = async () => {
    try {
      const response = await fetch('/api/hscode/remaining-searches');
      const data = await response.json();
      // 여기서도 data.remaining 형태로 응답 온다고 가정하고 업데이트
      if (data.remaining && typeof data.remaining.single === 'number' && typeof data.remaining.bulk === 'number') {
        setRemainingSearches({
          single: data.remaining.single,
          bulk: data.remaining.bulk,
          isLimited: data.remaining.isLimited ?? true,
        });
      } else {
        setRemainingSearches({
          single: 0,
          bulk: 0,
          isLimited: true,
        });
      }
    } catch (error) {
      console.error('Error fetching remaining searches:', error);
      setRemainingSearches({
        single: 0,
        bulk: 0,
        isLimited: true,
      });
    }
  };

  useEffect(() => {
    fetchRemainingSearches();
  }, []);

  const fetchHSCode = async () => {
    if (!validateProducts()) {
      return;
    }

    setIsLoading(true);
    setQueryStatus("6자리 HS CODE 조회 중...");

    try {
      const response = await fetch('/api/hscode/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();
      
      console.log('API Response:', data);

      // ▼ 추가 부분: bulk 응답에 remaining 필드가 있다고 가정
      if (data.remaining && typeof data.remaining.single === 'number' && typeof data.remaining.bulk === 'number') {
        // 남은 검색 횟수 전역 상태 업데이트
        setRemainingSearches({
          single: data.remaining.single,
          bulk: data.remaining.bulk,
          isLimited: data.remaining.isLimited ?? true,
        });
      }

      if (data.hscodes) {
        setResults(data.hscodes);
        setQueryStatus("6자리 HS CODE 조회 완료");
      } else {
        console.error('Invalid response format:', data);
        setQueryStatus("조회 실패: 잘못된 응답 형식");
      }
    } catch (error) {
      console.error('Error:', error);
      setQueryStatus("조회 실패");
      alert('HS CODE 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetch10DigitHSCodeForSingle = async (sixDigitCode: string, productName: string) => {
    setIsLoading(true);
    setQueryStatus(`${productName}의 10자리 코드 조회 중...`);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_HSCODE_API_URL;
      const serviceKey = decodeURIComponent(process.env.NEXT_PUBLIC_HSCODE_API_KEY!);

      const cleanCode = sixDigitCode.replace(/[^\d]/g, '').slice(0, 6);
      const lastDigit = cleanCode[5];
      const searchCode = lastDigit === '0' ? cleanCode.slice(0, 5) : cleanCode;

      console.log(`Original code: ${sixDigitCode}, Search code: ${searchCode}`);

      const filteredItems: GroupedItem[] = [];
      let currentPage = 1;
      let totalProcessed = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const params = new URLSearchParams({
          'serviceKey': serviceKey,
          'page': String(currentPage),
          'perPage': '5000',
          'returnType': 'JSON',
          'HS부호': searchCode,
        });

        const url = `${apiUrl}?${params.toString()}`;
        console.log(`Fetching page ${currentPage} with code ${searchCode}`);

        const response = await fetchWithTimeout(url);
        const pageData: APIResponse = await response.json();

        if (!pageData.data || pageData.data.length === 0) {
          hasMoreData = false;
          break;
        }

        const matchingItems = pageData.data
          .filter((item: HSCodeItem) => {
            const itemHSCode = String(item.HS부호).padStart(10, '0');
            return searchCode.length === 5
              ? itemHSCode.substring(0, 5) === searchCode
              : itemHSCode.substring(0, 6) === cleanCode;
          })
          .map((item: HSCodeItem) => ({
            name: item.한글품목명 || 'N/A',
            hscode: String(item.HS부호),
            description: item.규격사항내용 || '',
          }));

        filteredItems.push(...matchingItems);

        totalProcessed += pageData.data.length;
        currentPage++;

        if (totalProcessed >= pageData.matchCount) {
          hasMoreData = false;
        }
      }

      if (filteredItems.length === 0) {
        throw new Error(`${productName}에 대한 10자리 HS CODE를 찾을 수 없습니다.`);
      }

      setResults(prev => prev.map(result => {
        if (!('items' in result) && result.hscode === sixDigitCode) {
          return {
            title: result.name,
            items: filteredItems,
          };
        }
        return result;
      }));

      setQueryStatus(`${productName}의 10자리 코드 조회 완료`);
      await fetchRemainingSearches();
    } catch (error) {
      console.error('Error:', error);
      setQueryStatus(`${productName} 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetch10DigitHSCodeForAll = async () => {
    setIsLoading(true);
    setQueryStatus('전체 10자리 HS CODE 조회 중...');

    try {
      const sixDigitCodes = results
        .filter((result): result is InitialResult => !('items' in result))
        .map(result => ({
          code: result.hscode.replace(/[^\d]/g, ''),
          name: result.name,
        }));

      if (sixDigitCodes.length === 0) {
        setQueryStatus('조회할 6자리 코드가 없습니다.');
        return;
      }

      console.log('전체 조회 대상:', sixDigitCodes);

      const allResults = await Promise.allSettled(
        sixDigitCodes.map(({ code, name }) =>
          fetch10DigitHSCodeForSingle(code, name)
        )
      );

      const successCount = allResults.filter(result => result.status === 'fulfilled').length;
      const failureCount = allResults.length - successCount;

      console.log(`전체 조회 성공: ${successCount}, 실패: ${failureCount}`);
      setQueryStatus('전체 10자리 HS CODE 조회 완료!');
      await fetchRemainingSearches();
    } catch (error) {
      console.error('전체 조회 실패:', error);
      setQueryStatus('전체 조회 실패');
      alert('전체 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-1/2 p-4 bg-white">
        <RemainingSearchesDisplay remaining={remainingSearches} />
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
          <p>이곳은 사용자가 제품별로 HS CODE를 조회할 수 있는 기능입니다.</p>
          <p>좌측에서 제품 정보를 입력하고, 조회 버튼을 클릭하세요.</p>
          <p>최대 10개까지 입력 가능합니다. 엑셀 양식을 활용하세요</p>
          <p>엑셀 파일을 업로드하면 파일의 내용이 자동 입력됩니다.</p>
          <p>조회된 HS CODE는 우측 결과 창에 표시됩니다.</p>
        </div>

        {/* File upload and sample download section */}
        <div className="mb-4 flex items-center justify-between">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block"
          />
          <button
            onClick={downloadSampleExcel}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <span className="mr-1">📥</span>
            엑셀 입력 양식 다운로드
          </button>
        </div>

        {/* Products input section */}
        <div className="bg-white p-4 rounded-md shadow-sm">
          {products.map((product, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md">
              <label className="block mb-2">제품명</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
                placeholder="제품명을 입력하세요"
              />

              <label className="block mb-2">재질</label>
              <select
                value={product.material}
                onChange={(e) => handleProductChange(index, 'material', e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
              >
                <option value="">재질을 선택하세요</option>
                {Object.entries(MATERIAL_CODES).map(([code, name]) => (
                  <option key={code} value={name}>{name}</option>
                ))}
              </select>

              <label className="block mb-2">기타</label>
              <textarea
                value={product.description}
                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="추가 설명을 입력하세요"
              />
              <button
                onClick={() => removeProduct(index)}
                className="text-red-500 mt-2"
              >
                삭제
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              onClick={addProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + 제품 추가
            </button>
            <button
              onClick={fetchHSCode}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              조회
            </button>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="w-1/2 p-4 bg-white">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">조회 결과</h2>
            {results.length > 0 && (
              <div className="flex space-x-4">
                <button
                  onClick={fetch10DigitHSCodeForAll}
                  className="px-4 py-2 mb-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  10자리 전체 조회하기
                </button>
                <button
                  onClick={downloadSelectedItems}
                  className="px-4 py-2 mb-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  📥 선택 항목 다운로드
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="text-sm text-gray-500">조회 중...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-white shadow-sm">
                  {'items' in result ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">{result.title}</p>
                        <button
                          onClick={() => toggleExpand(result.title)}
                          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          {expandedResults[result.title] ? '접기' : '펼치기'}
                        </button>
                      </div>
                      {expandedResults[result.title] && (
                        <div className="space-y-2">
                          {result.items?.map((item, itemIndex) => (
                            <div key={itemIndex} className="pl-4 border-l-2 border-gray-200 flex justify-between items-center py-2">
                              <div>
                                <p>제품명: {item.name}</p>
                                <p className="text-gray-700">HS CODE: {item.hscode}</p>
                              </div>
                              <div className="flex space-x-2">
                                {selectedItems[result.title]?.hscode === item.hscode ? (
                                  <button
                                    onClick={() => handleItemDeselect(result.title)}
                                    className="px-3 py-1 rounded-md bg-blue-600 text-white"
                                  >
                                    선택됨
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleItemSelect(result.title, item)}
                                    className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  >
                                    선택
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-bold">제품명: {result.name}</p>
                        <p className="text-gray-700">HS CODE: {result.hscode}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetch10DigitHSCodeForSingle(result.hscode, result.name)}
                          className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          10자리 조회
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <p>제품 정보를 입력하고 조회 버튼을 클릭하세요.</p>
              <p className="text-sm mt-2">결과가 여기에 표시됩니다.</p>
            </div>
          )}

          <p className="mt-2 text-center">{queryStatus}</p>
        </div>
      </div>

      <LoadingStatus isLoading={isLoading} status={queryStatus} />
    </div>
  );
};

export default BulkHSCodePage;