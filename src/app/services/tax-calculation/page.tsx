"use client"

import React, { useState } from 'react';
import { Factory, Anchor, Building } from 'lucide-react';

// 인코텀즈 타입 정의
interface Incoterm {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

interface HsCode {
  id: string;
  code: string;
  description: string;
}

export default function CalculationTax() {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [showHsCodes, setShowHsCodes] = useState<boolean>(false);
  const [hsCodes, setHsCodes] = useState<HsCode[]>([{ id: '1', code: '', description: '' }]);
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [taxableAmount, setTaxableAmount] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setFormValues({...formValues, [field]: numValue});
  };

  const incoterms: Incoterm[] = [
    { id: 'exw-fca', name: 'EXW/FCA', icon: Factory, description: '수출국 공장 (EXW/FCA)' },
    { id: 'fob', name: 'FOB', icon: Anchor, description: '수출국 항구 (FOB)' },
    { id: 'cfr-cif', name: 'CFR/CIF', icon: Anchor, description: '수입국 항구 (CFR/CIF)' },
    { id: 'dap-ddp', name: 'DAP/DDP', icon: Building, description: '수입국 도착지 (DAP/DDP)' }
  ];

  const addHsCode = () => {
    setHsCodes([...hsCodes, { id: String(hsCodes.length + 1), code: '', description: '' }]);
  };

  const updateHsCode = (id: string, field: keyof HsCode, value: string) => {
    setHsCodes(hsCodes.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleTermClick = (termId: string) => {
    setSelectedTerm(termId);
    setShowHsCodes(false);
    setTaxableAmount(null);
    setFormValues({});
  };
  
  const calculateTaxableAmount = () => {
    if (!selectedTerm) return;
    
    let total = 0;
    
    if (selectedTerm === 'exw-fca') {
      // EXW/FCA -> 1 + 2 + 3 + 4
      total = (formValues.invoice || 0) + 
              (formValues.exportTransport || 0) + 
              (formValues.importShipping || 0) + 
              (formValues.exportCustoms || 0);
    } else if (selectedTerm === 'fob') {
      // FOB -> 1 + 2
      total = (formValues.invoice || 0) + 
              (formValues.importShipping || 0);
    } else if (selectedTerm === 'cfr-cif') {
      // CFR/CIF -> 1 + 2 + 3
      total = (formValues.invoice || 0) + 
              (formValues.importExtraFees || 0) + 
              (formValues.insurance || 0);
    } else if (selectedTerm === 'dap-ddp') {
      // DAP/DDP -> 1 - 2 - 3
      total = (formValues.invoice || 0) - 
              (formValues.importTransport || 0) - 
              (formValues.importCustoms || 0);
    }
    
    setTaxableAmount(total);
    setShowHsCodes(true);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">1. 적합한 인코텀즈 조건을 선택해주세요.</h1>
      
      {/* Incoterms Shipping Line */}
      <div className="my-12">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* 수평 연결선 - 하나만 */}
          <div className="absolute h-1 bg-blue-500 left-10 right-10 top-10 z-0"></div>
          
          {/* 아이콘 그룹 */}
          <div className="flex justify-between w-full relative z-10">
            {incoterms.map((term, index) => (
              <div 
                key={term.id} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleTermClick(term.id)}
              >
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  ${selectedTerm === term.id ? 'bg-blue-600' : 'bg-blue-100'}
                  border-4 border-white shadow-lg transition-all duration-300
                `}>
                  <term.icon 
                    className={`w-10 h-10 ${selectedTerm === term.id ? 'text-white' : 'text-blue-600'}`} 
                  />
                </div>

                {/* 두 번째와 세 번째 아이콘 사이에 세로 연결선 추가 */}
                {index === 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-20 bg-blue-500" style={{ top: '0px' }}></div>
                )}

                <div className="mt-3 text-center">
                  <p className="font-bold text-lg">{term.name}</p>
                  <p className="text-sm text-gray-600">{term.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-12">
        {!selectedTerm ? (
          <>
            <p className="text-lg">통관 시 예상세액을 계산할 수 있는 공간입니다</p>
            <p className="text-gray-600">위의 조건 중 하나를 선택하여 세액 계산을 시작하세요</p>
          </>
        ) : (
          <>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                2. 과세표준을 위해 아래 내용을 기입해주세요.
              </h2>
              
              {selectedTerm === 'exw-fca' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      인보이스 총 금액 (USD로 환산)
                    </label>
                    <input
                      type="text"
                      value={formValues.invoice || ''}
                      onChange={(e) => handleInputChange('invoice', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수출국 내 운송 및 관련된 총 비용
                    </label>
                    <input
                      type="text"
                      value={formValues.exportTransport || ''}
                      onChange={(e) => handleInputChange('exportTransport', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수입국 항구까지의 선박운임 및 그 부대비용 중 과세대상
                    </label>
                    <input
                      type="text"
                      value={formValues.importShipping || ''}
                      onChange={(e) => handleInputChange('importShipping', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EXW인 경우 → 수출국 내 통관 비용
                    </label>
                    <input
                      type="text"
                      value={formValues.exportCustoms || ''}
                      onChange={(e) => handleInputChange('exportCustoms', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
              
              {selectedTerm === 'fob' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      인보이스 총 금액 (USD로 환산)
                    </label>
                    <input
                      type="text"
                      value={formValues.invoice || ''}
                      onChange={(e) => handleInputChange('invoice', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수입국 항구까지의 선박운임 및 그 부대비용 중 과세대상
                    </label>
                    <input
                      type="text"
                      value={formValues.importShipping || ''}
                      onChange={(e) => handleInputChange('importShipping', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
              
              {selectedTerm === 'cfr-cif' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      인보이스 총 금액 (USD로 환산)
                    </label>
                    <input
                      type="text"
                      value={formValues.invoice || ''}
                      onChange={(e) => handleInputChange('invoice', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수입국 항구 도착 시 발생된 운임 부대비용 중 과세대상
                    </label>
                    <input
                      type="text"
                      value={formValues.importExtraFees || ''}
                      onChange={(e) => handleInputChange('importExtraFees', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CIF인 경우 보험비용
                    </label>
                    <input
                      type="text"
                      value={formValues.insurance || ''}
                      onChange={(e) => handleInputChange('insurance', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
              
              {selectedTerm === 'dap-ddp' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      인보이스 총 금액 (USD로 환산)
                    </label>
                    <input
                      type="text"
                      value={formValues.invoice || ''}
                      onChange={(e) => handleInputChange('invoice', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수입국 항구 도착 후 발생한 운임 및 기타 관련 비용
                    </label>
                    <input
                      type="text"
                      value={formValues.importTransport || ''}
                      onChange={(e) => handleInputChange('importTransport', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DDP인 경우 통관 관련 비용
                    </label>
                    <input
                      type="text"
                      value={formValues.importCustoms || ''}
                      onChange={(e) => handleInputChange('importCustoms', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
              
              {taxableAmount !== null && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="font-medium text-blue-800">과세가격 합계: {taxableAmount.toLocaleString()} USD</p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={calculateTaxableAmount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  계산하기
                </button>
              </div>
            </div>
            
            {showHsCodes && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  3. 제품의 HS CODE를 입력해주세요.
                </h2>
                
                {hsCodes.map((hsCode, index) => (
                  <div key={hsCode.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">제품 {index + 1}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          HS CODE
                        </label>
                        <input
                          type="text"
                          value={hsCode.code}
                          onChange={(e) => updateHsCode(hsCode.id, 'code', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="예: 8471.30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          제품 설명
                        </label>
                        <input
                          type="text"
                          value={hsCode.description}
                          onChange={(e) => updateHsCode(hsCode.id, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="제품에 대한 간단한 설명"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 space-x-2">
                  <button
                    onClick={addHsCode}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    + 제품 추가
                  </button>
                  
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    계산하기
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}