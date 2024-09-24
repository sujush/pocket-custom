"use client"

import React, { useState, useEffect } from 'react'
import { useToast } from "@/components/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ToastAction } from "@/components/ui/toast"
import CommonInputForm from './CommonInputForm'
import DetailInputForm from './DetailInputForm'
import { CommonData, ProductData, Product } from './types'
import { validateCommonData, calculateAmount } from './utils'

// 더미 제품 데이터
const dummyProducts: Product[] = [
  { id: '1', hsCode: '123456', englishName: '샘플 제품 1' },
  { id: '2', hsCode: '789012', englishName: '샘플 제품 2' },
]

export default function InvoiceAndPackingListForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast()
  
  // 공통 데이터 상태
  const [commonData, setCommonData] = useState<CommonData>({
    exporterName: '',
    exporterAddress: '',
    importerEnglishName: '',
    importerKoreanName: '',
    importerEnglishAddress: '',
    importerKoreanAddress: '',
    businessNumber: '',
    businessType: '',
    businessItem: '',
    phoneNumber: '',
    email: '',
    notifyParty: '',
    loadingPort: '',
    destinationPort: 'KRINC',
    transportMethod: 'ship',
    shippingDate: '',
  })

  // 제품 데이터 상태
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productData, setProductData] = useState<ProductData>({
    hsCode: '',
    englishName: '',
    unitPrice: '',
    quantity: '',
    currency: 'USD',
    quantityUnit: 'PC',
    amount: '',
    netWeight: '',
    grossWeight: '',
  })

  // 기타 상태
  const [customCurrency, setCustomCurrency] = useState('')
  const [customQuantityUnit, setCustomQuantityUnit] = useState('')
  const [isEditingHsCode, setIsEditingHsCode] = useState(false)
  const [isEditingEnglishName, setIsEditingEnglishName] = useState(false)
  const [isEditingNotifyParty, setIsEditingNotifyParty] = useState(false)

  // 제품 선택 시 효과
  useEffect(() => {
    if (selectedProduct) {
      setProductData(prev => ({
        ...prev,
        hsCode: selectedProduct.hsCode,
        englishName: selectedProduct.englishName,
      }))
    }
  }, [selectedProduct])

  // NOTIFY PARTY 자동 설정
  useEffect(() => {
    setCommonData(prev => ({
      ...prev,
      notifyParty: `${prev.importerEnglishName}\n${prev.importerEnglishAddress}`,
    }))
  }, [commonData.importerEnglishName, commonData.importerEnglishAddress])

  // 공통 입력 처리
  const handleCommonInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCommonData(prev => ({ ...prev, [name]: value }))
  }

  // 제품 입력 처리
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProductData(prev => ({ ...prev, [name]: value }))
  }

  // 선택 입력 처리
  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith('common.')) {
      setCommonData(prev => ({ ...prev, [name.split('.')[1]]: value }))
    } else {
      setProductData(prev => ({ ...prev, [name]: value }))
    }
  }

  // 단가 또는 수량 변경 시 금액 자동 계산
  useEffect(() => {
    const amount = calculateAmount(productData.unitPrice, productData.quantity)
    setProductData(prev => ({ ...prev, amount }))
  }, [productData.unitPrice, productData.quantity])

  // 제품 선택 처리
  const handleProductChange = (productId: string) => {
    const product = dummyProducts.find(p => p.id === productId)
    setSelectedProduct(product || null)
  }

  // 다음 페이지로 이동
  const handleNextPage = () => {
    const validationResult = validateCommonData(commonData)
    if (validationResult.isValid) {
      setCurrentPage(2)
    } else {
      toast({
        title: "입력 오류",
        description: validationResult.errorMessage,
        variant: "destructive",
        action: (
          <ToastAction altText="Try again">다시 시도</ToastAction>
        ),
      })
    }
  }

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    setCurrentPage(1)
  }

  // 폼 제출 처리
  const handleSubmit = () => {
    console.log('Form submitted', { commonData, productData })
    toast({
      title: "폼 제출 완료",
      description: "인보이스 및 패킹리스트가 성공적으로 제출되었습니다.",
      action: (
        <ToastAction altText="View details">상세 보기</ToastAction>
      ),
    })
    // 여기에 폼 제출 로직 추가
  }

  return (
    <div className="space-y-8">
      {currentPage === 1 && (
        <CommonInputForm
          commonData={commonData}
          handleCommonInputChange={handleCommonInputChange}
          handleSelectChange={handleSelectChange}
          isEditingNotifyParty={isEditingNotifyParty}
          setIsEditingNotifyParty={setIsEditingNotifyParty}
          handleNextPage={handleNextPage}
        />
      )}

      {currentPage === 2 && (
        <DetailInputForm
          selectedProduct={selectedProduct}
          productData={productData}
          handleProductChange={handleProductChange}
          handleProductInputChange={handleProductInputChange}
          handleSelectChange={handleSelectChange}
          isEditingHsCode={isEditingHsCode}
          setIsEditingHsCode={setIsEditingHsCode}
          isEditingEnglishName={isEditingEnglishName}
          setIsEditingEnglishName={setIsEditingEnglishName}
          customCurrency={customCurrency}
          setCustomCurrency={setCustomCurrency}
          customQuantityUnit={customQuantityUnit}
          setCustomQuantityUnit={setCustomQuantityUnit}
          handlePrevPage={handlePrevPage}
          handleSubmit={handleSubmit}
          dummyProducts={dummyProducts}
        />
      )}
      <Toaster />
    </div>
  )
}