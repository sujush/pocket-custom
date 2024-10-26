'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export const HSCodeForm: React.FC = () => {
  const [product, setProduct] = useState({
    material: '',
    function: '',
    shape: '',
    description: '',
  })
  const [hsCode, setHsCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Sending product data:', product);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hscode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      setHsCode(data.hsCode)
    } catch (error) {
      console.error('Error fetching HS Code:', error)
      // 에러 처리 로직 추가
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

      <Card className="w-1/2 h-3/4 overflow-auto">
        <CardHeader>
          <CardTitle>조회 결과</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          {hsCode ? (
            <p className="text-lg font-semibold">HS CODE: {hsCode}</p>
          ) : (
            <p className="text-gray-400">HS CODE를 조회하면 여기에 결과가 표시됩니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}