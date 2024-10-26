// src/app/services/import-requirements/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'


// 국가별 관세율 코드 매핑
const COUNTRY_RATE_TYPES = {
  // E1 적용 국가
  'CHN': ['E1', 'FCN1'], // 중국
  'IND': ['E1'], // 인도
  'LKA': ['E1'], // 스리랑카
  'BGD': ['E1'], // 방글라데시
  'LAO': ['E1', 'FAS1'], // 라오스
  'MNG': ['E1'], // 몽골

  // FAS1 적용 국가
  'VNM': ['FAS1', 'FVN1'], // 베트남
  'MMR': ['FAS1'], // 미얀마
  'SGP': ['FAS1'], // 싱가포르
  'MYS': ['FAS1'], // 말레이시아
  'IDN': ['FAS1'], // 인도네시아
  'PHL': ['FAS1'], // 필리핀
  'BRN': ['FAS1'], // 브루나이
  'KHM': ['FAS1'], // 캄보디아
  'THA': ['FAS1'], // 태국

  // FCA1 적용 국가
  'CAN': ['FCA1'], // 캐나다

  // FEU1 적용 국가 (EU 국가들)
  'GRC': ['FEU1'], // 그리스
  'NLD': ['FEU1'], // 네덜란드
  'DNK': ['FEU1'], // 덴마크
  'DEU': ['FEU1'], // 독일
  'LVA': ['FEU1'], // 라트비아
  'ROU': ['FEU1'], // 루마니아
  'LUX': ['FEU1'], // 룩셈부르크
  'LTU': ['FEU1'], // 리투아니아
  'MLT': ['FEU1'], // 몰타
  'BEL': ['FEU1'], // 벨기에
  'BGR': ['FEU1'], // 불가리아
  'CYP': ['FEU1'], // 사이프러스
  'SWE': ['FEU1'], // 스웨덴
  'ESP': ['FEU1'], // 스페인
  'SVK': ['FEU1'], // 슬로바키아
  'SVN': ['FEU1'], // 슬로베니아
  'IRL': ['FEU1'], // 아일랜드
  'EST': ['FEU1'], // 에스토니아
  'AUT': ['FEU1'], // 오스트리아
  'ITA': ['FEU1'], // 이탈리아
  'CZE': ['FEU1'], // 체코
  'PRT': ['FEU1'], // 포르투갈
  'POL': ['FEU1'], // 폴란드
  'FRA': ['FEU1'], // 프랑스
  'FIN': ['FEU1'], // 핀란드
  'HUN': ['FEU1'], // 헝가리
  'HRV': ['FEU1'], // 크로아티아

  // FUS1 적용 국가
  'USA': ['FUS1'] // 미국
}

// 국가 목록
const COUNTRIES = {
  'CHN': '중국',
  'IND': '인도',
  'LKA': '스리랑카',
  'BGD': '방글라데시',
  'LAO': '라오스',
  'MNG': '몽골',
  'VNM': '베트남',
  'MMR': '미얀마',
  'SGP': '싱가포르',
  'MYS': '말레이시아',
  'IDN': '인도네시아',
  'PHL': '필리핀',
  'BRN': '브루나이',
  'KHM': '캄보디아',
  'THA': '태국',
  'CAN': '캐나다',
  'USA': '미국',
  'GRC': '그리스',
  'NLD': '네덜란드',
  'DNK': '덴마크',
  'DEU': '독일',
  'LVA': '라트비아',
  'ROU': '루마니아',
  'LUX': '룩셈부르크',
  'LTU': '리투아니아',
  'MLT': '몰타',
  'BEL': '벨기에',
  'BGR': '불가리아',
  'CYP': '사이프러스',
  'SWE': '스웨덴',
  'ESP': '스페인',
  'SVK': '슬로바키아',
  'SVN': '슬로베니아',
  'IRL': '아일랜드',
  'EST': '에스토니아',
  'AUT': '오스트리아',
  'ITA': '이탈리아',
  'CZE': '체코',
  'PRT': '포르투갈',
  'POL': '폴란드',
  'FRA': '프랑스',
  'FIN': '핀란드',
  'HUN': '헝가리',
  'HRV': '크로아티아'
}

// 기본 관세율 코드
const BASE_RATE_TYPES = ['A', 'C', 'P1', 'P3', , 'W1', 'W2']

// 관세율 구분 설명
const RATE_TYPE_MAPPING = {
  'A': 'A (기본세율)',
  'C': 'C (WTO협정세율)',
  'E1': 'E1 (아ㆍ태 협정-일반양허관세)',
  'FAS1': 'FAS1 (한-아세안 협정관세)',
  'FCA1': 'FCA1 (한-캐나다 협정관세)',
  'FCN1': 'FCN1 (한-중국 협정관세)',
  'FEU1': 'FEU1 (한-유럽연합 협정관세)',
  'FUS1': 'FUS1 (한-미국 협정관세)',
  'FVN1': 'FVN1 (한-베트남 협정관세)',
  'P1': 'P1 (할당관세-추천)',
  'P3': 'P3 (할당관세-전량)',
  'W1': 'W1 (WTO 협정관세-추천세율)',
  'W2': 'W2 (WTO 협정관세-미추천세율)'
}

export default function ImportRequirementsPage() {
  const router = useRouter() //컴포넌트 함수 내부로 이동
  const [hsCode, setHsCode] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // HS CODE 입력 핸들러
  const handleInputChange = (e) => {
    setHsCode(e.target.value)
    setIsSubmitted(false)
  }

  // 조회 버튼 클릭 핸들러
  const handleSubmit = (e) => {
    e.preventDefault()
    if (hsCode.length !== 10) {
      alert('HS CODE 10자리를 입력해 주세요.')
      return
    }
    setIsSubmitted(true)
  }

  // 국가 선택 핸들러
  const handleCountryChange = (value) => {
    setSelectedCountry(value)
    if (isSubmitted) {
      setIsSubmitted(true) // 국가 변경 시 재조회 트리거
    }
  }

  // API 호출 및 데이터 처리
  useEffect(() => {
    const fetchHsCodeData = async () => {
      if (!isSubmitted) return

      const apiUrl = process.env.NEXT_PUBLIC_TARIFF_API_URL
      const apiKey = process.env.NEXT_PUBLIC_TARIFF_API_KEY

      const fullUrl = `${apiUrl}?serviceKey=${apiKey}&page=1&perPage=100&returnType=JSON&cond[품목번호::EQ]=${hsCode}`

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(fullUrl)

        if (!response.ok) {
          throw new Error('API 요청 실패')
        }

        const data = await response.json()
        
        // 허용된 관세율구분 결정
        let allowedTypes = [...BASE_RATE_TYPES]
        if (selectedCountry && selectedCountry !== 'ALL' && COUNTRY_RATE_TYPES[selectedCountry]) {
          allowedTypes = [...allowedTypes, ...COUNTRY_RATE_TYPES[selectedCountry]]
        }

        // 데이터 필터링
        const filteredData = data.data.filter(item => 
          allowedTypes.includes(item.관세율구분)
        )

        if (filteredData.length === 0) {
          setError('입력하신 HS CODE에 대한 데이터가 없습니다.')
          setResults(null)
        } else {
          // 품목번호 형식 맞추기 및 정렬
          const formattedData = filteredData.map(item => ({
            ...item,
            품목번호: item.품목번호.toString().padStart(10, '0')
          })).sort((a, b) => {
            if (a.관세율구분 === 'A') return -1
            if (b.관세율구분 === 'A') return 1
            const rateA = parseFloat(a.관세율?.replace(/[^0-9.]/g, '') || '0')
            const rateB = parseFloat(b.관세율?.replace(/[^0-9.]/g, '') || '0')
            return rateA - rateB
          })

          setResults(formattedData)
        }

      } catch (error) {
        console.error('Error fetching HS Code details:', error)
        setError('데이터 조회 중 오류가 발생했습니다.')
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHsCodeData()
  }, [hsCode, selectedCountry, isSubmitted])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">HS CODE 조회</h1>
      
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={hsCode}
              onChange={handleInputChange}
              placeholder="HS CODE 10자리 입력"
              maxLength={10}
            />
          </div>
          
          <div>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="국가를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {Object.entries(COUNTRIES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '조회 중...' : '조회하기'}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <Card className="my-4 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : results && results.length > 0 ? (
          <Card className="my-4">
            <CardHeader>
              <CardTitle>조회 결과</CardTitle>
              <p className="text-sm text-gray-500">검색된 결과 수: {results.length}개</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {results.map((item, index) => (
                 <div 
                 key={index} 
                 className={`border p-4 rounded-lg bg-white shadow-sm ${
                   item.관세율구분 === 'A' ? 'border-blue-500 bg-blue-50' : ''
                 }`}
               >
                 <div className="grid grid-cols-4 gap-4 items-center">
                   <div className="space-y-1">
                     <p className="font-semibold text-gray-700">품목번호</p>
                     <p className="text-gray-900 font-mono">{item.품목번호}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="font-semibold text-gray-700">관세율구분</p>
                     <p className={`text-gray-900 ${
                       item.관세율구분 === 'A' ? 'font-bold text-blue-600' : ''
                     }`}>
                       {RATE_TYPE_MAPPING[item.관세율구분] || item.관세율구분 || '-'}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="font-semibold text-gray-700">관세율</p>
                     <p className="text-gray-900">{item.관세율 || '-'}</p>
                   </div>
                   <div className="flex justify-end">
                     {item.관세율구분 === 'A' && (
                       <Button
                         onClick={() => router.push(`/services/import-requirements/check/${item.품목번호}`)}
                         className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                       >
                         수입요건 확인
                       </Button>
                     )}
                   </div>
                 </div>
               </div>
               ))}
             </div>
           </CardContent>
         </Card>
       ) : null}
     </div>
   </div>
 )
}