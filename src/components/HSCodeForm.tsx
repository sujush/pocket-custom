'use client'

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';

const categoryOptions = [
  '가구', '조명', '컴퓨터용 제품', '공구', '농업용 또는 원예용 제품', '전기용품',
  '서적 또는 인쇄물', '운동용품', '식품', '모자 및 신발', '애완용품', '의료용품',
  '완구', '어린이제품', '직물제 의류 및 의류부속품', '편물제 의류 및 의류부속품',
  '자동차용품', '주방용품', '침구 또는 커튼', '두발 또는 구강용품', '화장품',
  'CD 또는 DVD', '시계', '악기', '도자제품', '가방', '가죽제품', '목욕용 제품',
  '액세서리', '해당사항 없음'
];

const functionOptions = [
  '전기를 사용하나요?',
  '가정에서 사용하는 제품인가요?',
  '유아용 제품인가요?',
  '기계거나 또는 정밀기기인가요?'
];

const defaultMaterialOptions = [
  '플라스틱제', '고무제', '도자제', '유리제', '방직용 섬유제', '가죽제', '금속제', '종이제', '나무제', '모르거나 해당사항 없음'
];

const textileMaterialOptions = [
  '면', '합성섬유', '재생ㆍ반합성섬유', '양모', '기타 동물의 부드러운 털', '견 (silk)', '리넨 (linen)'
];

interface HSCodeResult {
  품목번호: string,
  품목명: string,
  영문명: string,
  적용시작일: string,
  적용종료일: string,
  HS부호: string;
  한글품목명: string;
  영문품목명: string;
  기본세율: string;
  단위: string;
  적용시작일자: string;
  적용종료일자: string;
}

interface Product {
  category: string;
  material: string;
  name: string;
  usage: string;
  additionalDescription: string;
  additionalInput: string;
  functions: { [key: string]: string };
}

const fetchAllPages = async (sixDigitCode: string): Promise<HSCodeResult[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_HSCODE_API_URL;
  const apiKey = decodeURIComponent(process.env.NEXT_PUBLIC_HSCODE_API_KEY!);

  let allResults: HSCodeResult[] = [];
  let currentPage = 1;

  while (true) {
    try {
      const baseUrl = new URL(apiUrl!);
      baseUrl.searchParams.append('serviceKey', apiKey);
      baseUrl.searchParams.append('page', String(currentPage));
      baseUrl.searchParams.append('perPage', '5000');
      baseUrl.searchParams.append('returnType', 'JSON');

      console.log(`Fetching page ${currentPage} for HS Code: ${sixDigitCode}`);

      const response = await fetch(baseUrl.toString());
      if (!response.ok) break;

      const data = await response.json();

      // 데이터 구조 로깅
      console.log('Received data structure:', JSON.stringify(data, null, 2));

      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid data structure received:', data);
        break;
      }

      // HS CODE 비교 로직 개선
      const matchingResults = data.data.filter(item => {
        const itemHsCode = String(item.품목번호 || item.HS부호 || '').replace(/\D/g, '');
        console.log(`Comparing: ${itemHsCode} with ${sixDigitCode}`);
        return itemHsCode.startsWith(sixDigitCode);
      });

      allResults = [...allResults, ...matchingResults];

      // 페이지네이션 로직 개선
      if (data.data.length === 0 || currentPage * 5000 >= (data.matchCount || 0)) {
        break;
      }

      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      break;
    }
  }

  // 결과가 없는 경우 더 자세한 에러 메시지 제공
  if (allResults.length === 0) {
    throw new Error(`${sixDigitCode}에 해당하는 HS CODE를 찾을 수 없습니다. 다른 검색어로 다시 시도해주세요.`);
  }

  return allResults.map(result => ({
    품목번호: String(result.품목번호 || result.HS부호 || '').padStart(10, '0'),
    품목명: result.품목명 || result.한글품목명 || '설명 없음',
    영문명: result.영문명 || result.영문품목명 || '',
    기본세율: result.기본세율 || '확인 필요',
    단위: result.단위 || '-',
    적용시작일: result.적용시작일 || result.적용시작일자 || '-',
    적용종료일: result.적용종료일 || result.적용종료일자 || '-'
  }));
};

export const HSCodeForm: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    category: '',
    material: '',
    name: '',
    usage: '',
    additionalDescription: '',
    additionalInput: '',
    functions: {}
  });
  const [materialOptions, setMaterialOptions] = useState(defaultMaterialOptions);
  const [functions, setFunctions] = useState<{ [key: string]: string }>({});
  const [hsCode, setHsCode] = useState('');
  const [hsCodeResults, setHSCodeResults] = useState<HSCodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);

  const router = useRouter();

  const resetForm = () => {
    setFunctions({});
    setProduct({
      category: '',
      material: '',
      name: '',
      usage: '',
      additionalDescription: '',
      additionalInput: '',
      functions: {}
    });
  };

  useEffect(() => {
    if (resetTrigger) {
      resetForm();
      setResetTrigger(false);
    }
  }, [resetTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCategoryChange = (value: string) => {
    setProduct(prev => ({ ...prev, category: value, material: '' }));
    setFunctions({});

    if (value === '직물제 의류 및 의류부속품' || value === '편물제 의류 및 의류부속품' || value === '모자 및 신발') {
      setMaterialOptions(textileMaterialOptions);
    } else {
      setMaterialOptions(defaultMaterialOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    setHSCodeResults([]);
    setError('');
    setHsCode('');

    try {
      if (!product.category) {
        throw new Error('제품 카테고리 선택해주세요.');
      }

      if (product.category === '해당사항 없음') {
        if (!product.additionalInput.trim()) {
          throw new Error('제품에 대한 상세 정보를 입력해주세요.');
        }
      } else {
        if (Object.keys(functions).length < functionOptions.length) {
          throw new Error('제품의 기능 및 용도에 대한 모든 질문에 답해주세요.');
        }
        if (!product.material) {
          throw new Error('제품의 재질을 선택해주세요.');
        }
        if (!product.name.trim()) {
          throw new Error('제품의 명칭을 입력해주세요.');
        }
        if (!product.usage.trim()) {
          throw new Error('제품의 용도를 입력해주세요.');
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hscode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...product, functions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'AI API 요청 실패');
      }

      const data = await response.json();

      console.log("Received HS Code:", data.hsCode); // AI에서 가져온 HS Code가 6자리인지 확인합니다.

      if (!data.hsCode) {
        throw new Error('HS CODE를 받아오지 못했습니다');
      }

      const sixDigitCode: string = data.hsCode.trim().substring(0, 6);

      if (!/^\d{6}$/.test(sixDigitCode)) {
        throw new Error('유효하지 않은 HS CODE 형식입니다');
      }

      setHsCode(sixDigitCode);

      const allResults: HSCodeResult[] = await fetchAllPages(sixDigitCode);

      const filteredResults = allResults
        .filter(item => {
          const hsCode = String(item.품목번호).padStart(10, '0');
          return hsCode.substring(0, 6) === sixDigitCode;
        })
        .map(item => ({
          품목번호: String(item.HS부호).padStart(10, '0'),
          품목명: item.한글품목명 || '설명 없음',
          영문명: item.영문품목명 || '',
          기본세율: '확인 필요',
          단위: item.단위 || '-',
          적용시작일: item.적용시작일자 || '-',
          적용종료일: item.적용종료일자 || '-'
        }));

      if (filteredResults.length === 0) {
        throw new Error(`${sixDigitCode}에 해당하는 HS CODE를 찾을 수 없습니다.`);
      }

      setHSCodeResults(filteredResults as HSCodeResult[]);

      // 오류가 없는 경우에만 폼 초기화
      setResetTrigger(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleNavigateToRequirements = (hsCode: string) => {
    router.push(`/services/import-requirements/${hsCode}`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/2 p-4 flex flex-col overflow-auto">
        <h1 className="text-2xl font-bold mb-4">10단위 조회</h1>

        <Card className="mb-4 flex-shrink-0">
          <CardHeader>
            <CardTitle>코드를 조회하기 전에 아래의 내용을 확인하세요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "안녕하세요. 여기서 HS CODE 10단위를 조회할 수 있습니다.",
              "HS CODE는 6자리까지 세계 공통으로 적용됩니다.",
              "아래에 HS CODE에 필요한 내용을 기재해주면 HS CODE 10자리를 제공합니다.",
              "만약 [유효하지 않은 HS CODE 형식] 이라고 나오는 경우 더 자세하게 작성하세요",
              "제시된 10자리 중 가장 유사한 것을 확정하세요"
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-2">
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-shrink-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="제품 카테고리를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {product.category && product.category !== '해당사항 없음' && (
                <>
                  {functionOptions.map(question => (
                    <div key={question}>
                      <p>{question}</p>
                      <div onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        setFunctions(prev => ({
                          ...prev,
                          [question]: target.value
                        }));
                        setProduct(prev => ({
                          ...prev,
                          functions: { ...prev.functions, [question]: target.value }
                        }));
                      }}>
                        <label style={{ marginRight: '10px' }}>
                          <input type="radio" value="예" name={question} /> 예
                        </label>
                        <label>
                          <input type="radio" value="아니오" name={question} /> 아니오
                        </label>
                      </div>
                    </div>
                  ))}

                  <Select onValueChange={value => setProduct(prev => ({ ...prev, material: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="제품의 재질을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    placeholder="제품의 영문 명칭 또는 한글 명칭을 기재해주세요"
                    required
                  />
                  <Input
                    type="text"
                    name="usage"
                    value={product.usage}
                    onChange={handleInputChange}
                    placeholder="제품의 용도를 기재해주세요"
                    required
                  />
                  <Textarea
                    name="additionalDescription"
                    value={product.additionalDescription}
                    onChange={handleInputChange}
                    placeholder="그 외 설명할 부분을 상세하게 기재해주세요 (공백 가능)"
                    rows={5}
                  />
                </>
              )}

              {product.category === '해당사항 없음' && (
                <Textarea
                  name="additionalInput"
                  value={product.additionalInput}
                  onChange={handleInputChange}
                  placeholder="제품에 대한 재질, 용도, 작동방식, 그 외 설명할 수 있는 내용을 상세하게 기재해주세요."
                  required
                  rows={10}
                />
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? '조회 중...' : 'HS CODE 조회'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="w-1/2 p-4">
        <Card className="h-full overflow-auto">
          <CardHeader>
            <CardTitle>조회 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-2 p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">HS CODE를 조회하고 있습니다...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : hsCode ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-lg font-semibold text-blue-800">
                    HS CODE 6자리: {hsCode}
                  </p>
                </div>

                {hsCodeResults.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-medium text-gray-600">
                      검색된 품목 수: {hsCodeResults.length}개
                    </p>
                    <div className="grid gap-4">
                      {hsCodeResults.map((result, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="grid gap-2">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-lg font-bold">
                                  {result.품목번호}
                                </span>
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                  {result.단위}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-900">{result.품목명}</p>
                                <p className="text-gray-500 text-sm">{result.영문명}</p>
                              </div>
                              <div className="text-sm text-gray-600 pt-2">
                                <p>적용기간: {result.적용시작일} ~ {result.적용종료일}</p>
                              </div>
                              <div className='pt-2'>
                                <Button
                                  className='w-full'
                                  onClick={() => handleNavigateToRequirements(result.품목번호)}
                                >
                                  세율 및 요건확인
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <p>제품 정보를 입력하고 조회 버튼을 클릭하세요.</p>
                <p className="text-sm mt-2">결과가 여기에 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
