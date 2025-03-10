'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ExternalLink, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  koreanName: string;
  englishName: string;
  hsCode: string;
  totalCount: number;
  totalPackageCount: number;
  totalAmount: number;
  totalWeight: number;
  totalCBM: number;
}

const LCLCostCalculationPage = () => {
  const router = useRouter();

  const [location, setLocation] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      koreanName: '',
      englishName: '',
      hsCode: '',
      totalCount: 0,
      totalPackageCount: 0,
      totalAmount: 0,
      totalWeight: 0,
      totalCBM: 0,
    },
  ]);
  const [needsOriginCertificate, setNeedsOriginCertificate] = useState<boolean>(false);
  const [needsDelivery, setNeedsDelivery] = useState<boolean>(false);
  const [needsOriginLabel, setNeedsOriginLabel] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [lclOnlyCost, setLclOnlyCost] = useState<number | null>(null);

  // 비용 범위를 저장할 상태 추가
  const [costRange, setCostRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  // 통관세금 정보를 저장할 상태 추가
  const [customsTax, setCustomsTax] = useState<number | null>(null);

  // 통관세금 입력 필드 상태
  const [customsTaxInput, setCustomsTaxInput] = useState<string>('');
  const [showCustomsTaxInput, setShowCustomsTaxInput] = useState<boolean>(false);

  // 세션 스토리지에서 저장된 데이터 로드
  useEffect(() => {
    // LCL 계산 데이터 로드
    const savedData = sessionStorage.getItem('lclCalculationData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setLocation(parsedData.location || '');
      setProducts(parsedData.products || []);
      setNeedsOriginCertificate(parsedData.needsOriginCertificate || false);
      setNeedsDelivery(parsedData.needsDelivery || false);
      setNeedsOriginLabel(parsedData.needsOriginLabel || false);

      // 세션 스토리지에 저장
      if (parsedData.totalCost) {
        setTotalCost(parsedData.totalCost);
        setLclOnlyCost(parsedData.lclOnlyCost || parsedData.totalCost);
        setCostRange(parsedData.costRange || null);
        // 계산 결과가 있으면 통관세금 입력 필드 표시
        setShowCustomsTaxInput(true);
      }

      if (parsedData.customsTax) {
        setCustomsTax(parsedData.customsTax);
        setCustomsTaxInput(parsedData.customsTax.toString());
      }
    }

    // 통관세금 데이터 로드
    const taxData = sessionStorage.getItem('customsTaxData');
    if (taxData) {
      const parsedTaxData = JSON.parse(taxData);
      const taxAmount = parsedTaxData.taxAmount || 0;

      // 통관세금이 있다면 설정
      if (taxAmount) {
        setCustomsTax(taxAmount);
        setCustomsTaxInput(taxAmount.toString());
        setShowCustomsTaxInput(true);

        // 기존 계산 결과가 있다면 합산된 새 계산 결과 생성
        if (totalCost) {
          const newTotal = totalCost + taxAmount;
          setTotalCost(newTotal);
          setCostRange({
            min: Math.round(newTotal * 0.9),
            max: Math.round(newTotal * 1.1)
          });
        }

        // 세금이 적용되었음을 표시하기 위해 세션 스토리지 업데이트
        sessionStorage.removeItem('customsTaxData');
      }
    }
  }, []);

  // HS CODE 페이지로 이동하기 전 데이터 저장
  const navigateToHsCode = () => {
    // 현재 상태를 세션 스토리지에 저장
    const dataToSave = {
      location,
      products,
      needsOriginCertificate,
      needsDelivery,
      needsOriginLabel,
      totalCost,
      lclOnlyCost,
      costRange,
      customsTax
    };
    sessionStorage.setItem('lclCalculationData', JSON.stringify(dataToSave));

    // HS CODE 페이지로 이동
    router.push('/services/hscode');
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: products.length + 1,
        koreanName: '',
        englishName: '',
        hsCode: '',
        totalCount: 0,
        totalPackageCount: 0,
        totalAmount: 0,
        totalWeight: 0,
        totalCBM: 0,
      },
    ]);
  };

  const removeProduct = (id: number) => {
    if (products.length === 1) return;
    setProducts(products.filter((product) => product.id !== id));
  };

  const updateProduct = (id: number, field: keyof Product, value: string | number) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  // 통관세금 적용 함수
  const applyCustomsTax = () => {
    const taxValue = parseInt(customsTaxInput, 10);
    if (isNaN(taxValue) || taxValue < 0) {
      alert('유효한 통관세금을 입력해주세요.');
      return;
    }

    setCustomsTax(taxValue);

    // 기존 LCL 비용에 통관세금 추가
    if (lclOnlyCost) {
      const newTotal = lclOnlyCost + taxValue;
      setTotalCost(newTotal);
      setCostRange({
        min: Math.round(newTotal * 0.9),
        max: Math.round(newTotal * 1.1)
      });

      // 세션 스토리지 업데이트
      const savedData = sessionStorage.getItem('lclCalculationData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.customsTax = taxValue;
        parsedData.totalCost = newTotal;
        parsedData.costRange = {
          min: Math.round(newTotal * 0.9),
          max: Math.round(newTotal * 1.1)
        };
        sessionStorage.setItem('lclCalculationData', JSON.stringify(parsedData));
      }
    }
  };

  const calculateTotalCost = () => {
    // Base transportation costs per location
    const transportationRates = {
      weihai: 88000,
      yiwu: 93500,
      guangzhou: 154000,
    };

    // Validate location selection
    if (!location) {
      alert('지역을 선택해주세요.');
      return;
    }

    // Validate product information
    const isValid = products.every(
      (product) =>
        product.koreanName &&
        product.englishName &&
        product.hsCode &&
        product.totalCount > 0 &&
        product.totalPackageCount > 0 &&
        product.totalAmount > 0 &&
        product.totalWeight > 0 &&
        product.totalCBM > 0
    );

    if (!isValid) {
      alert('모든 제품 정보를 입력해주세요.');
      return;
    }

    // Calculate total CBM across all products
    const totalCBM = products.reduce((sum, product) => sum + product.totalCBM, 0);

    // Calculate total product count across all products
    const totalProductCount = products.reduce((sum, product) => sum + product.totalCount, 0);

    // Calculate total package count across all products
    const totalPackageCount = products.reduce((sum, product) => sum + product.totalPackageCount, 0);

    // Calculate costs
    const transportationCost = totalCBM * transportationRates[location as keyof typeof transportationRates];
    const blCost = 22000; // BL 발행비 (제품 개수와 무관)
    const customsCost = 33000; // 관세사 수수료 (제품 개수와 무관)
    const deliveryCost = needsDelivery ? totalPackageCount * 11000 : 0; // 택배 발송 비용
    const originCertificateCost = needsOriginCertificate ? 44000 : 0; // 원산지증명서 발행 비용 (제품 개수와 무관)
    const originLabelCost = needsOriginLabel ? totalProductCount * 77 : 0; // 원산지 표시 비용

    // Calculate total cost without customs tax
    const lclCost = transportationCost + blCost + customsCost + deliveryCost + originCertificateCost + originLabelCost;
    setLclOnlyCost(lclCost);

    // Apply customs tax if available
    const total = customsTax ? lclCost + customsTax : lclCost;
    setTotalCost(total);

    // Calculate cost range (±10%)
    const range = {
      min: Math.round(total * 0.9),
      max: Math.round(total * 1.1)
    };
    setCostRange(range);

    // 계산 결과를 세션 스토리지에 저장
    const dataToSave = {
      location,
      products,
      needsOriginCertificate,
      needsDelivery,
      needsOriginLabel,
      totalCost: total,
      lclOnlyCost: lclCost,
      costRange: range,
      customsTax
    };
    sessionStorage.setItem('lclCalculationData', JSON.stringify(dataToSave));

    // 계산 후 통관세금 입력 영역 표시
    setShowCustomsTaxInput(true);
  };

  // 지역 이름 반환 함수
  const getLocationName = () => {
    switch (location) {
      case 'weihai': return '웨이하이';
      case 'yiwu': return '이우';
      case 'guangzhou': return '광저우';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">LCL 사업자 통관 배송대행 비용 계산</CardTitle>
          <CardDescription>제품 정보와 옵션을 입력하여 총 비용을 계산하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 설명 카드 */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">사용법 설명</h3>
                <p className="text-sm text-gray-700">
                  본 페이지는 LCL 사업자 통관 시 발생하는 배송대행비용을 계산하는 도구입니다.
                  우선 웨이하이, 이우, 광저우 중 출발지를 선택하신 후 제품 정보를 입력해주세요.
                  여러 제품을 추가할 수 있으며, 각 제품별로 HS CODE 확인이 필요하시면 &apos;HS CODE 찾기&apos; 버튼을 이용하세요.
                  모든 정보 입력 후 &apos;비용 계산하기&apos; 버튼을 클릭하시면 예상 비용이 계산됩니다.
                  예상 비용이므로 실제 비용과 차이가 날 수 있으니 단순 참고용으로 활용하시기 바랍니다.
                </p>
              </CardContent>
            </Card>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location">지역 선택</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weihai">웨이하이</SelectItem>
                  <SelectItem value="yiwu">이우</SelectItem>
                  <SelectItem value="guangzhou">광저우</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-4" />

            {/* Products Section */}
            <div className="space-y-6">
              {products.map((product, index) => (
                <div key={product.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">제품 {index + 1}</h3>
                    {products.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`koreanName-${product.id}`}>제품 한글명</Label>
                      <Input
                        id={`koreanName-${product.id}`}
                        value={product.koreanName}
                        onChange={(e) =>
                          updateProduct(product.id, 'koreanName', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`englishName-${product.id}`}>제품 영문명</Label>
                      <Input
                        id={`englishName-${product.id}`}
                        value={product.englishName}
                        onChange={(e) =>
                          updateProduct(product.id, 'englishName', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hsCode-${product.id}`}>HS CODE</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`hsCode-${product.id}`}
                          value={product.hsCode}
                          onChange={(e) =>
                            updateProduct(product.id, 'hsCode', e.target.value)
                          }
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={navigateToHsCode}
                        >
                          HS CODE 찾기
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalCount-${product.id}`}>제품 총 개수</Label>
                      <Input
                        id={`totalCount-${product.id}`}
                        type="number"
                        min="0"
                        value={product.totalCount || ''}
                        onChange={(e) =>
                          updateProduct(product.id, 'totalCount', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalPackageCount-${product.id}`}>제품 총 포장 개수</Label>
                      <Input
                        id={`totalPackageCount-${product.id}`}
                        type="number"
                        min="0"
                        value={product.totalPackageCount || ''}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            'totalPackageCount',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalAmount-${product.id}`}>제품 총 금액 (원)</Label>
                      <Input
                        id={`totalAmount-${product.id}`}
                        type="number"
                        min="0"
                        value={product.totalAmount || ''}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            'totalAmount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalWeight-${product.id}`}>제품 총 무게 (kg)</Label>
                      <Input
                        id={`totalWeight-${product.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.totalWeight || ''}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            'totalWeight',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalCBM-${product.id}`}>제품 총 CBM (㎥)</Label>
                      <Input
                        id={`totalCBM-${product.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.totalCBM || ''}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            'totalCBM',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addProduct}
                className="w-full"
              >
                제품 추가
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">추가 옵션</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="originCertificate"
                    checked={needsOriginCertificate}
                    onCheckedChange={(checked) => setNeedsOriginCertificate(!!checked)}
                  />
                  <Label htmlFor="originCertificate" className="cursor-pointer">
                    원산지증명서 발행 필요
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delivery"
                    checked={needsDelivery}
                    onCheckedChange={(checked) => setNeedsDelivery(!!checked)}
                  />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    택배로 발송
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="originLabel"
                    checked={needsOriginLabel}
                    onCheckedChange={(checked) => setNeedsOriginLabel(!!checked)}
                  />
                  <Label htmlFor="originLabel" className="cursor-pointer">
                    원산지 표시 필요 (스티커 기준)
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={calculateTotalCost} className="w-full py-6 text-lg">
              비용 계산하기
            </Button>

            {/* Result Section */}
            {totalCost !== null && costRange !== null && (
              <div className="mt-6 p-6 bg-slate-50 rounded-lg space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">예상 비용 범위</h3>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-primary">
                      {costRange.min.toLocaleString()} ~ {costRange.max.toLocaleString()} 원
                    </p>
                    {!needsDelivery && (
                      <p className="text-sm text-red-500 mb-1">
                        (화물 배송 비용은 별도입니다)
                      </p>
                    )}
                  </div>

                  {/* 통관세금 입력 필드 */}
                  {showCustomsTaxInput && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="customsTaxInput">통관세금 (원)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customsTaxInput"
                          type="number"
                          min="0"
                          placeholder="통관세금 입력"
                          value={customsTaxInput}
                          onChange={(e) => setCustomsTaxInput(e.target.value)}
                        />
                        <Button variant="secondary" onClick={applyCustomsTax}>
                          적용
                        </Button>
                      </div>
                    </div>
                  )}

                  {customsTax && customsTax > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-700">
                        ✓ 통관세금 {customsTax.toLocaleString()}원이 포함되었습니다
                      </p>
                    </div>
                  )}

                  {/* 통관세금 포함된 전체 비용 표시 */}
                  {customsTax && customsTax > 0 && lclOnlyCost && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-md">
                      <h4 className="font-medium text-blue-800">
                        LCL [{getLocationName()}] 전체 비용
                      </h4>
                      <div className="flex justify-between text-blue-900 mt-1">
                        <span>배송대행 비용:</span>
                        <span>{lclOnlyCost.toLocaleString()} 원</span>
                      </div>
                      <div className="flex justify-between text-blue-900">
                        <span>통관세금:</span>
                        <span>{customsTax.toLocaleString()} 원</span>
                      </div>
                      <div className="flex justify-between text-blue-900 font-semibold mt-2 pt-2 border-t border-blue-200">
                        <span>합계:</span>
                        <span>{totalCost.toLocaleString()} 원</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // 통관세금 계산에 필요한 제품 정보를 쿼리 파라미터로 전달
                    const totalAmount = products.reduce((sum, product) => sum + product.totalAmount, 0);
                    const queryParams = new URLSearchParams({
                      amount: totalAmount.toString(),
                      source: location,
                      returnToLCL: 'true' // 돌아오기 위한 플래그
                    }).toString();

                    router.push(`/services/tax-calculation?${queryParams}`);
                  }}
                >
                  통관세금 확인하기 <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                {/* 배송대행지 찾기 버튼 */}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push('/services/delivery-agents')}
                >
                  배송대행지 찾기 <Search className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LCLCostCalculationPage;