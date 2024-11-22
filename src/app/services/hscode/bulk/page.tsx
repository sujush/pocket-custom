'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader } from 'lucide-react';

// 재질 코드 매핑 상수 추가
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
};

// 코드로 재질명 얻기
const getMaterialNameByCode = (code: string): string => {
  return MATERIAL_CODES[code as keyof typeof MATERIAL_CODES] || '모르거나 해당사항 없음';
};

// fetchWithTimeout 함수를 여기에 추가
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

// Item 타입 정의 추가
type Item = {
  name: string;
  hscode: string;
};

// 업로드된 제품 타입 정의 추가
type UploadedProduct = {
  name: string;
  material: string;
  description: string;
};

interface HSCodeItem {
  HS부호?: string;
  한글품목명?: string;
}

interface GroupedItem {
  name: string;
  hscode: string;
}

// 초기 결과 타입 정의 (6자리)
interface InitialResult {
  name: string;
  hscode: string;
}

// 처리된 결과 타입 정의 (10자리)
interface ProcessedResult {
  title: string;
  items: GroupedItem[];
}


// 결과 타입을 유니온으로 정의
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
  const [products, setProducts] = useState([{ name: '', material: '', description: '' }]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStatus, setQueryStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item }>({});
  const [expandedResults, setExpandedResults] = useState<{ [key: string]: boolean }>({});

  const MAX_PRODUCTS_LIMIT = 20;


  const toggleExpand = (productName: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [productName]: !prev[productName]
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
      const newItems: { [key: string]: Item } = { ...prev };
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
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      // 엑셀 파일 데이터를 Uint8Array 형식으로 변환하여 XLSX 모듈에 전달
      const data = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 타입을 `Array<{ [key: string]: string }>`로 지정하여 `any` 오류 해결
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
    // 샘플 데이터 생성
    const sampleData = [
      {
        '제품명': '',
        '재질코드': '',
        '기타': '',
      },
      {
        '제품명': '',
        '재질코드': '',
        '기타': '',
      },
      {
        '제품명': '',
        '재질코드': '',
        '기타': '',
      },
      {
        '제품명': '아래는 재질코드 가이드입니다 ▼',
        '재질코드': '업로드 시 삭제',
        '기타': '',
      },
      {
        '제품명': '──────────────',
        '재질코드': '──────────',
        '기타': '──────────',
      },
      // 재질 코드 가이드를 샘플 데이터 아래에 추가
      ...Object.entries(MATERIAL_CODES).map(([_, name]) => ({
        '제품명': name,
        '재질코드': _, // 이 부분은 필요에 따라 수정
        '기타': `${_} 입력 시 ${name}로 자동 변환`,
      })),
      {
        '제품명': '',
        '재질코드': '',
        '기타': '',
      },
      {
        '제품명': '■ 입력 예시',
        '재질코드': '',
        '기타': '',
      },
      {
        '제품명': '플라스틱 용기',
        '재질코드': 'P',
        '기타': '500ml 용량의 투명 용기',
      },
      {
        '제품명': '고무 장갑',
        '재질코드': 'R',
        '기타': '주방용 고무 장갑',
      },
    ];

    const workbook = XLSX.utils.book_new();

    // 입력 양식 시트 생성
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // 열 너비 설정
    const columnWidths = [
      { wch: 30 },  // 제품명
      { wch: 15 },  // 재질코드
      { wch: 40 },  // 기타
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, '입력양식');

    // 파일 다운로드
    XLSX.writeFile(workbook, 'HS_CODE_조회_양식.xlsx');
  };

  const downloadSelectedItems = () => {
    // selectedItems의 각 항목을 `[string, Item]`으로 타입 지정하여 `name`과 `hscode` 속성에 접근
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

  const fetchHSCode = async () => {
    if (!validateProducts()) {
      return;
    }

    setIsLoading(true);
    setQueryStatus("6자리 HS CODE 조회 중...");

    try {
      console.log('Sending products to API:', products); // 요청 데이터 확인
      const response = await fetch('/api/hscode/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();
      console.log('API Response:', data); // API 응답 확인
      console.log('API Response Details:', JSON.stringify(data.hscodes[0], null, 2));
      if (data.hscodes && Array.isArray(data.hscodes)) {
        console.log('Setting results:', data.hscodes); // results 설정 전 데이터 확인
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

  const fetch10DigitHSCode = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_HSCODE_API_URL;
    const serviceKey = process.env.NEXT_PUBLIC_HSCODE_API_KEY;

    setIsLoading(true);
    setQueryStatus("10자리 HS CODE 조회 중...");

    try {
      if (!results || results.length === 0) {
        setQueryStatus("조회할 6자리 HS CODE가 없습니다.");
        return;
      }

      // 타입 가드 함수
      const isInitialResult = (result: Result): result is InitialResult => {
        return 'hscode' in result;
      };

      // 타입 체크 추가
      const hs6Codes = results
        .filter(isInitialResult)  // 여기서 InitialResult 타입만 필터링
        .map(result => result.hscode);  // 이제 안전하게 hscode에 접근 가능

      console.log('Extracting 6-digit codes:', hs6Codes);

      if (hs6Codes.length === 0) {
        setQueryStatus("유효한 6자리 HS CODE가 없습니다.");
        return;
      }

      const allResults: HSCodeItem[] = [];


      for (const hs6Code of hs6Codes) {
        try {
          let currentPage = 1;
          let totalFetched = 0;
          let totalDataCount = Infinity;

          while (totalFetched < totalDataCount) {
            const url = new URL(apiUrl!);
            url.searchParams.append('serviceKey', serviceKey!);
            url.searchParams.append('page', String(currentPage));
            url.searchParams.append('perPage', '5000');
            url.searchParams.append('returnType', 'JSON');
            url.searchParams.append('HS부호', hs6Code);

            console.log(`Fetching data for HS Code ${hs6Code}, page ${currentPage}`);

            const response = await fetchWithTimeout(url.toString());

            if (!response.ok) {
              console.error(`Error fetching data for HS Code ${hs6Code}:`, response.statusText);
              break;
            }

            const data = await response.json();

            if (!data || !data.data) {
              console.error(`Invalid response data for HS Code ${hs6Code}`);
              break;
            }

            if (currentPage === 1) {
              totalDataCount = data.matchCount || 0;
              console.log(`Total data count for ${hs6Code}:`, totalDataCount);
            }

            const filteredData = data.data
              .filter((item: HSCodeItem) => {
                const itemHsCode = String(item.HS부호 || '');
                return itemHsCode.startsWith(hs6Code);
              });

            console.log(`Filtered data count for ${hs6Code}:`, filteredData.length);
            allResults.push(...filteredData);

            totalFetched += data.currentCount || 0;
            if (totalFetched >= totalDataCount || data.data.length === 0) {
              break;
            }

            currentPage++;
          }
        } catch (error) {
          console.error(`Error processing HS Code ${hs6Code}:`, error);
          continue;
        }
      }

      if (allResults.length === 0) {
        setQueryStatus("조회된 10자리 품목번호가 없습니다.");
        return;
      }

      console.log('Processing all results:', allResults);

      // 결과를 제품별로 그룹화
      const groupedResults = allResults.reduce<Record<string, GroupedItem[]>>((groups, item) => {
        // 타입 가드 함수
        const isInitialResult = (result: Result): result is InitialResult => {
          return 'hscode' in result;
        };

        const originalProduct = results
          .filter(isInitialResult)
          .find(r => r.hscode === item.HS부호?.substring(0, 6));
        const productName = originalProduct?.name || '알 수 없는 제품';

        if (!groups[productName]) {
          groups[productName] = [];
        }

        groups[productName].push({
          name: item.한글품목명 || 'N/A',
          hscode: item.HS부호 || ''
        });

        return groups;
      }, {});

      console.log('Grouped results:', groupedResults);

      const processedResults: ProcessedResult[] = Object.entries(groupedResults).map(([productName, items]) => ({
        title: `${productName}에 대한 10자리 코드 목록`,
        items: items
      }));

      console.log('Final processed results:', processedResults);
      setResults(processedResults);
      setSelectedItems({});
      setQueryStatus("10자리 HS CODE 조회 완료!");

    } catch (error) {
      console.error('10자리 HS CODE 조회 실패:', error);
      setQueryStatus("조회 실패: " + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
      alert('HS CODE 10자리 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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

      const params = new URLSearchParams({
        'serviceKey': serviceKey,
        'page': '1',
        'perPage': '5000',
        'returnType': 'JSON',
        'hsSgn': sixDigitCode.replace(/\./g, '')
      });

      const url = `${apiUrl}?${params.toString()}`;


      console.log('Full Request URL (without serviceKey):',
        url.replace(serviceKey, 'SERVICE_KEY_HIDDEN'));  // 전체 URL 로깅

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        console.error('API Response:', await response.text());  // 에러 응답 로깅 추가
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      console.log('API Response Structure:', {
        dataKeys: Object.keys(data),
        sampleItem: data.data?.[0],  // 첫 번째 아이템의 구조 확인
        totalItems: data.data?.length
      });

      if (!data || !data.data) {
        throw new Error('유효하지 않은 응답 데이터');
      }

      const filteredItems = data.data
        .filter((item: HSCodeItem) => {
          const itemHSCode = String(item.HS부호).padStart(10, '0');
          // 6자리만 자른 후 비교
          const first6Digits = itemHSCode.substring(0, 6);
          return first6Digits === sixDigitCode;
        })
        .map((item: HSCodeItem) => ({
          name: item.한글품목명 || 'N/A',
          hscode: String(item.HS부호)
        }));

      // 매칭된 항목들 로깅
      if (filteredItems.length > 0) {
        console.log('Found matches:', filteredItems);
      }

      // 결과를 현재 results에 추가
      setResults(prev => prev.map(result => {
        if (!('items' in result) && result.hscode === sixDigitCode) {
          return {
            title: result.name,
            items: filteredItems
          };
        }
        return result;
      }));

      // 해당 항목 자동으로 펼치기
      setExpandedResults(prev => ({
        ...prev,
        [productName]: true
      }));

      setQueryStatus(`${productName}의 10자리 코드 조회 완료`);
    } catch (error) {
      console.error('Error:', error);
      setQueryStatus('조회 실패');
    } finally {
      setIsLoading(false);
    }
  };


  console.log('Rendering with results:', results); // 렌더링 시 results 상태 확인

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-1/2 p-4 bg-white">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
          <p>이곳은 사용자가 제품별로 HS CODE를 조회할 수 있는 기능입니다.</p>
          <p>좌측에서 제품 정보를 입력하고, 조회 버튼을 클릭하세요.</p>
          <p>최대 10개까지 입력 가능합니다. 엑셀 양식을 활용하세요</p>
          <p>엑셀 파일을 업로드하면 파일의 내용이 자동 입력됩니다.</p>
          <p>조회된 HS CODE는 우측 결과 창에 표시됩니다.</p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block" />
          <button
            onClick={downloadSampleExcel}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <span className="mr-1">📥</span>
            엑셀 입력 양식 다운로드
          </button>
        </div>

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
              <button onClick={() => removeProduct(index)} className="text-red-500 mt-2">
                삭제
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button onClick={addProduct} className="px-4 py-2 bg-blue-500 text-white rounded-md">
              + 제품 추가
            </button>
            <button onClick={fetchHSCode} className="px-4 py-2 bg-green-500 text-white rounded-md">
              조회
            </button>
          </div>
        </div>
      </div>

      <div className="w-1/2 p-4 bg-white">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">조회 결과</h2>
            {results.length > 0 && (
              <button
                onClick={downloadSelectedItems}
                className="px-4 py-2 mb-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                📥 선택 항목 다운로드
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-500">조회 중...</p>
            </div>
          ) : results && results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-white shadow-sm">
                  {'items' in result ? (
                    // 10자리 결과 표시 (ProcessedResult 타입)
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">{result.title}</p>
                        <button
                          onClick={() => toggleExpand(result.title)}
                          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
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
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // 6자리 결과 표시 (InitialResult 타입)
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-bold">제품명: {result.name}</p>
                        <p className="text-gray-700">HS CODE: {result.hscode}</p>
                      </div>
                      <div className="flex space-x-2">
                        {selectedItems[result.name]?.hscode === result.hscode ? (
                          <button
                            onClick={() => handleItemDeselect(result.name)}
                            className="px-3 py-1 rounded-md bg-blue-600 text-white"
                          >
                            선택됨
                          </button>
                        ) : (
                          <button
                            onClick={() => handleItemSelect(result.name, result)}
                            className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            선택
                          </button>
                        )}
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

              {/* 전체 조회 버튼 추가 */}
              {results.length > 0 && !('items' in results[0]) && (
                <button
                  onClick={fetch10DigitHSCode}
                  className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition-colors"
                >
                  전체 물품에 대해 HS CODE 10자리 조회
                </button>
              )}
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