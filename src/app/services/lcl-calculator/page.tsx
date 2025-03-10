'use client';

import React, { useState } from 'react';
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
import { Trash2, ExternalLink } from 'lucide-react';
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

  // 비용 상세 내역을 저장할 상태 추가
  const [costBreakdown, setCostBreakdown] = useState<{
    transportationCost: number;
    blCost: number;
    customsCost: number;
    deliveryCost: number;
    originCertificateCost: number;
    originLabelCost: number;
  } | null>(null);

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

    // 비용 상세 내역 저장
    setCostBreakdown({
      transportationCost,
      blCost,
      customsCost,
      deliveryCost,
      originCertificateCost,
      originLabelCost
    });

    // Calculate total cost
    const total = transportationCost + blCost + customsCost + deliveryCost + originCertificateCost + originLabelCost;
    setTotalCost(total);
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
                          onClick={() => router.push('/services/hscode')}
                        >
                          확인하기
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
                        step="0.001"
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
            {totalCost !== null && costBreakdown !== null && (
              <div className="mt-6 p-6 bg-slate-50 rounded-lg space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">비용 상세 내역</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>운송비 (CBM × 지역별 요율)</span>
                      <span>{costBreakdown.transportationCost.toLocaleString()} 원</span>
                    </li>
                    <li className="flex justify-between">
                      <span>BL 발행비</span>
                      <span>{costBreakdown.blCost.toLocaleString()} 원</span>
                    </li>
                    <li className="flex justify-between">
                      <span>관세사 수수료</span>
                      <span>{costBreakdown.customsCost.toLocaleString()} 원</span>
                    </li>
                    {costBreakdown.deliveryCost > 0 && (
                      <li className="flex justify-between">
                        <span>택배 발송 비용</span>
                        <span>{costBreakdown.deliveryCost.toLocaleString()} 원</span>
                      </li>
                    )}
                    {costBreakdown.originCertificateCost > 0 && (
                      <li className="flex justify-between">
                        <span>원산지증명서 발행 비용</span>
                        <span>{costBreakdown.originCertificateCost.toLocaleString()} 원</span>
                      </li>
                    )}
                    {costBreakdown.originLabelCost > 0 && (
                      <li className="flex justify-between">
                        <span>원산지 표시 비용</span>
                        <span>{costBreakdown.originLabelCost.toLocaleString()} 원</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">총 비용</h3>
                  <p className="text-3xl font-bold text-primary">
                    {totalCost.toLocaleString()} 원
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/services/tax-calculation')}
                >
                  통관세금 확인하기 <ExternalLink className="ml-2 h-4 w-4" />
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