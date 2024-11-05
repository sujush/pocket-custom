// DetailInputForm.tsx

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product, ProductData } from './types'

type DetailInputFormProps = {
  selectedProduct: Product | null;
  productData: ProductData;
  handleProductChange: (productId: string) => void;
  handleProductInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isEditingHsCode: boolean;
  setIsEditingHsCode: (value: boolean) => void;
  isEditingEnglishName: boolean;
  setIsEditingEnglishName: (value: boolean) => void;
  customCurrency: string;
  setCustomCurrency: (value: string) => void;
  customQuantityUnit: string;
  setCustomQuantityUnit: (value: string) => void;
  handlePrevPage: () => void;
  handleSubmit: () => void;
  dummyProducts: Product[];
}

export default function DetailInputForm({
  selectedProduct,
  productData,
  handleProductChange,
  handleProductInputChange,
  handleSelectChange,
  isEditingHsCode,
  setIsEditingHsCode,
  isEditingEnglishName,
  setIsEditingEnglishName,
  customCurrency,
  setCustomCurrency,
  customQuantityUnit,
  setCustomQuantityUnit,
  handlePrevPage,
  handleSubmit,
  dummyProducts
}: DetailInputFormProps) {
  return (
    <>
      <h2 className="text-2xl font-bold">상세 입력 사항</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="product">제품 선택</Label>
          <Select onValueChange={handleProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="제품을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {dummyProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.englishName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <>
            <div>
              <Label htmlFor="hsCode">HS CODE</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="hsCode" 
                  name="hsCode"
                  value={productData.hsCode} 
                  onChange={handleProductInputChange}
                  disabled={!isEditingHsCode}
                />
                <Button onClick={() => setIsEditingHsCode(!isEditingHsCode)}>
                  {isEditingHsCode ? '저장' : '수정'}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="englishName">제품 영문명</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="englishName" 
                  name="englishName"
                  value={productData.englishName} 
                  onChange={handleProductInputChange}
                  disabled={!isEditingEnglishName}
                />
                <Button onClick={() => setIsEditingEnglishName(!isEditingEnglishName)}>
                  {isEditingEnglishName ? '저장' : '수정'}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="unitPrice">제품 단가</Label>
              <div className="flex space-x-2">
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  value={productData.unitPrice}
                  onChange={handleProductInputChange}
                />
                <Select name="currency" onValueChange={(value) => handleSelectChange('currency', value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="통화" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="KRW">KRW</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="custom">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {productData.currency === 'custom' && (
              <div>
                <Label htmlFor="customCurrency">사용자 지정 통화</Label>
                <Input
                  id="customCurrency"
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="quantity">제품 수량</Label>
              <div className="flex space-x-2">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={productData.quantity}
                  onChange={handleProductInputChange}
                />
                <Select name="quantityUnit" onValueChange={(value) => handleSelectChange('quantityUnit', value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="단위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="M2">M2</SelectItem>
                    <SelectItem value="CT">CT</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="GT">GT</SelectItem>
                    <SelectItem value="custom">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {productData.quantityUnit === 'custom' && (
              <div>
                <Label htmlFor="customQuantityUnit">사용자 지정 수량 단위</Label>
                <Input
                  id="customQuantityUnit"
                  value={customQuantityUnit}
                  onChange={(e) => setCustomQuantityUnit(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="amount">제품 금액</Label>
              <Input id="amount" name="amount" value={productData.amount} disabled />
            </div>
            <div>
              <Label htmlFor="netWeight">제품 순중량 (kg)</Label>
              <Input
                id="netWeight"
                name="netWeight"
                type="number"
                value={productData.netWeight}
                onChange={handleProductInputChange}
              />
            </div>
            <div>
              <Label htmlFor="grossWeight">제품 총중량 (kg)</Label>
              <Input
                id="grossWeight"
                name="grossWeight"
                type="number"
                value={productData.grossWeight}
                onChange={handleProductInputChange}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={handlePrevPage}>이전</Button>
        <Button onClick={handleSubmit}>제출</Button>
      </div>
    </>
  )
}