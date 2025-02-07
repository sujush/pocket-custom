'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CertifiedFoodInspection() {
  const [category, setCategory] = useState<'가공식품' | '기구ㆍ용기등' | null>(null)
  const [feature, setFeature] = useState<'한글표시사항 작성' | '검사비용 확인' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<string | null>(null)

  // 결과 확인 버튼 클릭 시 실행되는 함수
  const handleSubmit = () => {
    if (!category || !feature) {
      alert("검사 유형과 기능을 선택해주세요.")
      return
    }

    // 임시 결과 값 설정
    setResult(`✅ ${category}에 대한 "${feature}" 결과: ${inputValue || '기본 정보'}`)
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">수입식품 검사 서비스</h2>

      {/* 1. 가공식품 vs 기구ㆍ용기등 선택 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">검사 유형을 선택하세요:</h3>
        <RadioGroup onValueChange={value => setCategory(value as '가공식품' | '기구ㆍ용기등')}>
          <RadioGroupItem value="가공식품" label="가공식품" />
          <RadioGroupItem value="기구ㆍ용기등" label="기구ㆍ용기등" />
        </RadioGroup>
      </div>

      {/* 2. 기능 선택 */}
      {category && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">이용할 기능을 선택하세요:</h3>
          <RadioGroup onValueChange={value => setFeature(value as '한글표시사항 작성' | '검사비용 확인')}>
            <RadioGroupItem value="한글표시사항 작성" label="한글표시사항 작성" />
            <RadioGroupItem value="검사비용 확인" label="검사비용 확인" />
          </RadioGroup>
        </div>
      )}

      {/* 3. 입력 폼 */}
      {feature && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">필요한 정보를 입력하세요:</h3>
          <Input 
            placeholder={`${feature}에 필요한 정보를 입력하세요.`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      )}

      {/* 4. 결과 확인 버튼 */}
      {feature && (
        <Button onClick={handleSubmit} className="w-full">
          결과 확인
        </Button>
      )}

      {/* 5. 결과 출력 */}
      {result && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-green-700 font-semibold">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
