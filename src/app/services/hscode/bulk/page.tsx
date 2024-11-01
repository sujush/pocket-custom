'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader } from 'lucide-react';

const LoadingStatus = ({ isLoading, status }) => {
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
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStatus, setQueryStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const MAX_PRODUCTS_LIMIT = 20;

  const handleItemSelect = (groupSixDigitCode, item) => {
    setSelectedItems(prev => ({
      ...prev,
      [groupSixDigitCode]: item
    }));
  };

  const handleItemDeselect = (groupSixDigitCode) => {
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
      alert(`최대 ${MAX_PRODUCTS_LIMIT}개의 제품만 추가할 수 있습니다.`);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const uploadedProducts = json.map((row) => ({
        name: row["제품명"] || '',
        material: row["재질"] || '',
        description: row["기타"] || '',
      }));

      setProducts(uploadedProducts);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadExcel = () => {
    let excelData;

    if (Array.isArray(results) && results[0]?.items) {
      excelData = results.flatMap(group => {
        const titleRow = {
          '구분': group.title,
          '제품명': '',
          'HS CODE': '',
        };

        const itemRows = group.items.map(item => ({
          '구분': '',
          '제품명': item.name,
          'HS CODE': item.hscode,
        }));

        const emptyRow = {
          '구분': '',
          '제품명': '',
          'HS CODE': '',
        };

        return [titleRow, ...itemRows, emptyRow];
      });
    } else {
      excelData = results.map(result => ({
        '제품명': result.name,
        'HS CODE': result.hscode,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const columnWidths = [
      { wch: 40 },
      { wch: 30 },
      { wch: 15 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HS CODE Results');

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `HSCode_Results_${currentDate}.xlsx`);
  };

  const downloadSelectedItems = () => {
    const excelData = Object.entries(selectedItems).map(([sixDigitCode, item]) => ({
      '제품명': item.name,
      'HS CODE': item.hscode
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const columnWidths = [
      { wch: 30 },  // 제품명 열
      { wch: 15 },  // HS CODE 열
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
      const response = await fetch('/api/hscode/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();
      if (data.hscodes) {
        setResults(data.hscodes);
        setQueryStatus("6자리 HS CODE 조회 완료");
      } else {
        console.error(data.error || 'HS CODE fetch failed');
        setQueryStatus("조회 실패");
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
      const hs6Codes = results.map(result => result.hscode.replace(/\s+/g, ''));
      const allResults = [];

      for (const hs6Code of hs6Codes) {
        let currentPage = 1;
        let totalFetched = 0;
        let totalDataCount = Infinity;

        while (totalFetched < totalDataCount) {
          const url = `${apiUrl}?serviceKey=${serviceKey}&page=${currentPage}&perPage=5000&returnType=JSON&HS부호=${hs6Code}`;

          const response = await fetch(url);

          if (!response.ok) {
            console.error(`Error fetching data for HS Code ${hs6Code}:`, response.statusText);
            break;
          }

          const data = await response.json();

          if (currentPage === 1) {
            totalDataCount = data.matchCount;
          }

          const filteredData = data.data.filter(item => {
            const itemHsCode = String(item.HS부호 || '');
            return itemHsCode.startsWith(hs6Code);
          });
          
          allResults.push(...filteredData);

          totalFetched += data.currentCount;
          currentPage++;
        }
      }

      if (allResults.length === 0) {
        setQueryStatus("조회된 10자리 품목번호가 없습니다.");
      } else {
        setQueryStatus("10자리 HS CODE 조회 완료!");
        
        const groupedResults = allResults.reduce((groups, item) => {
          const hsCode = String(item.HS부호);
          const sixDigitCode = hsCode.substring(0, 6);
          if (!groups[sixDigitCode]) {
            groups[sixDigitCode] = [];
          }
          groups[sixDigitCode].push({
            name: item.한글품목명 || 'N/A',
            hscode: hsCode
          });
          return groups;
        }, {});

        const processedResults = Object.entries(groupedResults).map(([sixDigitCode, items]) => {
          const originalProduct = products.find(p => {
            const result = results.find(r => r.hscode.replace(/\s+/g, '') === sixDigitCode);
            return result && result.name === p.name;
          });

          return {
            sixDigitCode,
            title: `${originalProduct?.name || '제품'} 에 대한 10자리 코드 목록`,
            items
          };
        });

        setResults(processedResults);
        setSelectedItems({});
      }
    } catch (error) {
      console.error('10자리 HS CODE 조회 실패:', error);
      setQueryStatus("조회 실패: " + (error.message || '알 수 없는 오류가 발생했습니다.'));
      alert('HS CODE 10자리 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-1/2 p-4 bg-white">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
          <p>이곳은 사용자가 제품별로 HS CODE를 조회할 수 있는 기능입니다.</p>
          <p>좌측에서 제품 정보를 입력하고, 조회 버튼을 클릭하세요.</p>
          <p>제품명과 재질을 입력하고 필요 시 기타 정보를 추가할 수 있습니다.</p>
          <p>엑셀 파일을 업로드하면 파일의 내용이 자동 입력됩니다.</p>
          <p>조회된 HS CODE는 우측 결과 창에 표시됩니다.</p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block" />
          <a href="/sample.xlsx" download className="text-blue-500">
            엑셀 양식 다운로드
          </a>
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
                <option value="플라스틱제">플라스틱제</option>
                <option value="고무제">고무제</option>
                <option value="도자제">도자제</option>
                <option value="유리제">유리제</option>
                <option value="방직용 섬유제">방직용 섬유제</option>
                <option value="가죽제">가죽제</option>
                <option value="금속제">금속제</option>
                <option value="종이제">종이제</option>
                <option value="나무제">나무제</option>
                <option value="모르거나 해당사항 없음">모르거나 해당사항 없음</option>
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
                onClick={downloadExcel} 
                className="px-4 py-2 mb-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                📥 조회 결과 엑셀 다운로드
              </button>
            )}
          </div>

          {Array.isArray(results) && results[0]?.items ? (
            <>
              {/* 그룹화된 결과 표시 */}
              <div className="mb-8">
                {results.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6 p-4 border rounded-md bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-blue-600">{group.title}</h3>
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="mb-2 pl-4 border-l-2 border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="font-bold">제품명: {item.name}</p>
                          <p className="text-gray-700">HS CODE: {item.hscode}</p>
                        </div>
                        <button
                          onClick={() => {
                            const isCurrentlySelected = selectedItems[group.sixDigitCode]?.hscode === item.hscode;
                            if (isCurrentlySelected) {
                              handleItemDeselect(group.sixDigitCode);
                            } else {
                              handleItemSelect(group.sixDigitCode, item);
                            }
                          }}
                          className={`px-3 py-1 rounded-md ${
                            selectedItems[group.sixDigitCode]?.hscode === item.hscode
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {selectedItems[group.sixDigitCode]?.hscode === item.hscode ? '선택됨' : '선택'}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 선택된 항목들 표시 */}
              {Object.keys(selectedItems).length > 0 && (
                <div className="mt-8 p-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-green-600">선택된 품목</h3>
                    <button 
                      onClick={downloadSelectedItems}
                      className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      📥 선택 항목 다운로드
                    </button>
                  </div>
                  {Object.entries(selectedItems).map(([sixDigitCode, item], index) => (
                    <div key={index} className="mb-4 p-3 bg-green-50 rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-bold">제품명: {item.name}</p>
                        <p className="text-gray-700">HS CODE: {item.hscode}</p>
                      </div>
                      <button
                        onClick={() => handleItemDeselect(sixDigitCode)}
                        className="px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        선택 해제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // 6자리 결과 표시
            <>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md">
                  <p className="font-bold">제품명: {result.name}</p>
                  <p>HS CODE: {result.hscode}</p>
                </div>
              ))}
              
              {/* 6자리 결과가 있을 때만 10자리 조회 버튼 표시 */}
              {results.length > 0 && (
                <button
                  onClick={fetch10DigitHSCode}
                  className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition-colors"
                >
                  전체 물품에 대해 HS CODE 10자리 조회
                </button>
              )}
            </>
          )}
          <p className="mt-2 text-center">{queryStatus}</p>
        </div>
      </div>
      
      <LoadingStatus isLoading={isLoading} status={queryStatus} />
    </div>
  );
};

export default BulkHSCodePage;