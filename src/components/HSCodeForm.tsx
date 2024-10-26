'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface HSCodeResult {
  품목번호: string;
  품목명: string;
  기본세율: string;
}

interface Product {
  material: string;
  function: string;
  shape: string;
  description: string;
}

export const HSCodeForm: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    material: '',
    function: '',
    shape: '',
    description: '',
  })
  const [hsCode, setHsCode] = useState('')
  const [hsCodeResults, setHSCodeResults] = useState<HSCodeResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({ ...prev, [name]: value }))
  }

  const fetchHSCodeDetails = async (sixDigitCode: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_HSCODE_API_URL
      const apiKey = process.env.NEXT_PUBLIC_HSCODE_API_KEY
  
      if (!apiUrl || !apiKey) {
        throw new Error('API 설정이 올바르지 않습니다.')
      }
  
      // URL 인코딩 처리와 함께 정확한 필터링 조건 설정
      const queryParams = new URLSearchParams({
        serviceKey: apiKey,
        page: '1',
        perPage: '100',
        returnType: 'JSON',
        [`cond[품목번호::PREFIX]`]: sixDigitCode  // LIKE 대신 PREFIX 사용
      }).toString()
  
      const fullUrl = `${apiUrl}?${queryParams}`
      console.log('Fetching HS Code details from:', fullUrl)
  
      const response = await fetch(fullUrl)
  
      if (!response.ok) {
        console.error('API Error:', await response.text())
        throw new Error('공공데이터 API 요청 실패')
      }
  
      const data = await response.json()
      console.log('API Response:', data)
  
      if (data.data && Array.isArray(data.data)) {
        setHSCodeResults(data.data)
      } else {
        setHSCodeResults([])
      }
  
    } catch (error) {
      console.error('Error fetching HS Code details:', error)
      setHSCodeResults([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setHSCodeResults([])

    try {
      console.log('Submitting product data:', product)
      
      // OpenAI API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hscode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error('AI API 요청 실패')
      }

      const data = await response.json()
      const sixDigitCode = data.hsCode.trim().substring(0, 6)
      console.log('Received HS Code:', sixDigitCode)
      setHsCode(sixDigitCode)

      // 6자리 코드로 공공데이터 API 호출
      await fetchHSCodeDetails(sixDigitCode)
    } catch (error) {
      console.error('Error in submission:', error)
      // 에러 처리 로직 추가 가능
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/2 p-4 flex flex-col overflow-auto">
        <h1 className="text-2xl font-bold mb-4">6단위 조회</h1>
        
        <Card className="mb-4 flex-shrink-0">
          <CardHeader>
            <CardTitle>코드를 조회하기 전에 아래의 내용을 확인하세요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "안녕하세요. 이연관세사무소 여러분",
              "HS CODE는 6자리까지 세계 공통으로 적용됩니다.",
              "아래에 HS CODE에 필요한 내용을 기재해주면 HS CODE 6자리를 제공합니다.",
              "6자리까지 확인되었다면 법령 검토 후 10단위를 확정하세요",
              "10자리를 확정한 경우 뒤로 돌아가 세율과 요건을 확인하세요"
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/eyeon_logo.png" alt="eyeon_logo" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-shrink-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="material"
                value={product.material}
                onChange={handleInputChange}
                placeholder="제품 재질"
                required
              />
              <Input
                type="text"
                name="function"
                value={product.function}
                onChange={handleInputChange}
                placeholder="제품의 기능 및 용도"
                required
              />
              <Input
                type="text"
                name="shape"
                value={product.shape}
                onChange={handleInputChange}
                placeholder="제품의 형태"
                required
              />
              <Input
                type="text"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="그 외 설명사항"
                required
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? '조회 중...' : 'HS CODE 조회'}
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
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : hsCode ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold"> HS CODE 6자리는 {hsCode} 입니다</p>
                </div>
                
                {hsCodeResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="font-medium text-gray-600">
                      검색된 품목 수: {hsCodeResults.length}개
                    </p>
                    {hsCodeResults.map((result, index) => (
                      <Card key={index} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="grid gap-2">
                            <div>
                              <span className="font-semibold">품목번호:</span>
                              <span className="ml-2 font-mono">{result.품목번호}</span>
                            </div>
                            <div>
                              <span className="font-semibold">품목명:</span>
                              <span className="ml-2">{result.품목명}</span>
                            </div>
                            <div>
                              <span className="font-semibold">기본세율:</span>
                              <span className="ml-2">{result.기본세율}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    해당 HS CODE에 대한 상세 정보를 찾을 수 없습니다.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>HS CODE를 조회하면 여기에 결과가 표시됩니다.</p>
                <p className="text-sm mt-2">제품 정보를 입력하고 조회 버튼을 클릭하세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}