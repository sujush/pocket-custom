'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface HSCodeResult {
  품목번호: string;
  품목명: string;
  영문명: string;
  기본세율: string;
  단위: string;
  적용시작일: string;
  적용종료일: string;
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
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const fetchAllPages = async (sixDigitCode: string): Promise<Array<any>> => {
    const apiUrl = process.env.NEXT_PUBLIC_HSCODE_API_URL
    const apiKey = process.env.NEXT_PUBLIC_HSCODE_API_KEY
    const decodedKey = decodeURIComponent(apiKey!)
    let allResults: Array<any> = []
    let currentPage = 1

    while (true) {
      const baseUrl = new URL(apiUrl!)
      baseUrl.searchParams.append('serviceKey', decodedKey)
      baseUrl.searchParams.append('page', String(currentPage))
      baseUrl.searchParams.append('perPage', '1000')
      baseUrl.searchParams.append('returnType', 'JSON')

      const response = await fetch(baseUrl.toString())
      if (!response.ok) break

      const data = await response.json()
      if (!data.data || data.data.length === 0) break

      allResults = [...allResults, ...data.data]
      
      if (data.data.length < 1000 || currentPage * 1000 >= data.matchCount) break
      currentPage++
    }

    return allResults
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitAsync()
  }

  const handleSubmitAsync = async () => {
    setIsSubmitting(true)
    setIsLoading(true)
    setHSCodeResults([])
    setError('')
    setHsCode('')

    try {
      // 입력값 검증
      const requiredFields = ['material', 'function', 'shape', 'description'] as const
      for (const field of requiredFields) {
        if (!product[field].trim()) {
          throw new Error(`${field} 필드를 입력해주세요.`)
        }
      }

      // OpenAI API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hscode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'AI API 요청 실패')
      }

      const data = await response.json()
      
      if (!data.hsCode) {
        throw new Error('HS CODE를 받아오지 못했습니다')
      }

      const sixDigitCode = data.hsCode.trim().substring(0, 6)
      
      if (!/^\d{6}$/.test(sixDigitCode)) {
        throw new Error('유효하지 않은 HS CODE 형식입니다')
      }

      setHsCode(sixDigitCode)
      console.log('Searching for HS Code:', sixDigitCode)

      // 모든 페이지에서 검색
      const allResults = await fetchAllPages(sixDigitCode)
      console.log('Total results fetched:', allResults.length)
      
      const filteredResults = allResults
        .filter(item => {
          const hsCode = String(item.HS부호).padStart(10, '0')
          const matches = hsCode.substring(0, 6) === sixDigitCode
          if (matches) {
            console.log('Found matching code:', hsCode)
          }
          return matches
        })
        .map(item => ({
          품목번호: String(item.HS부호).padStart(10, '0'),
          품목명: item.한글품목명 || '설명 없음',
          영문명: item.영문품목명 || '',
          기본세율: '확인 필요',
          단위: item.수량단위코드 || '-',
          적용시작일: item.적용시작일자 || '-',
          적용종료일: item.적용종료일자 || '-'
        }))

      console.log('Filtered results:', filteredResults)

      if (filteredResults.length === 0) {
        throw new Error(`${sixDigitCode}에 해당하는 HS CODE를 찾을 수 없습니다.`)
      }

      setHSCodeResults(filteredResults)
      
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
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
                  <AvatarFallback>EY</AvatarFallback>
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
                disabled={isSubmitting}
                required
              />
              <Input
                type="text"
                name="function"
                value={product.function}
                onChange={handleInputChange}
                placeholder="제품의 기능 및 용도"
                disabled={isSubmitting}
                required
              />
              <Input
                type="text"
                name="shape"
                value={product.shape}
                onChange={handleInputChange}
                placeholder="제품의 형태"
                disabled={isSubmitting}
                required
              />
              <Input
                type="text"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="그 외 설명사항"
                disabled={isSubmitting}
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full"
              >
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
                      해당하는 HS CODE 10자리: {hsCodeResults.length}개
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
  )
}