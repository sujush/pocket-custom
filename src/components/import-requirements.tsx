import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type ItemType = {
  품목번호: string;
  관세율구분: string;
  관세율?: string;
  // 필요한 다른 속성 추가
}

export const ImportRequirements: React.FC<{ hsCode: string }> = ({ hsCode }) => {
  const [results, setResults] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // 타입을 string | null로 변경

  // 관세율구분 코드 매핑
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
    'R': 'R (최빈국 특혜관세)',
    'W1': 'W1 (WTO 협정관세-추천세율)',
    'W2': 'W2 (WTO 협정관세-미추천세율)'
  }

  // 허용된 관세율구분 목록
  const ALLOWED_RATE_TYPES = Object.keys(RATE_TYPE_MAPPING)

  useEffect(() => {
    const fetchHsCodeData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_TARIFF_API_URL
      const apiKey = process.env.NEXT_PUBLIC_TARIFF_API_KEY

      const fullUrl = `${apiUrl}?serviceKey=${apiKey}&page=1&perPage=100&returnType=JSON&cond[품목번호::EQ]=${hsCode}`
      console.log("Final API Request URL:", fullUrl)

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(fullUrl, { method: 'GET' })

        if (!response.ok) {
          console.error('API 요청 실패:', response.statusText)
          throw new Error('API 요청 실패')
        }

        const data = await response.json()
        console.log('API 응답 데이터:', data)

        // 허용된 관세율구분만 필터링
        const filteredData = data.data.filter((item: { 관세율구분: string }) => 
          ALLOWED_RATE_TYPES.includes(item.관세율구분)
        )

        if (filteredData.length === 0) {
          setError('입력하신 HS CODE에 대한 데이터가 없습니다.')
          setResults([])
        } else {
          // 품목번호 형식 맞추기 (10자리 유지)
          const formattedData = filteredData.map((item: { 품목번호: number | string }) => ({
            ...item,
            품목번호: item.품목번호.toString().padStart(10, '0')
          }))

          // 관세율구분 A를 최상단으로, 나머지는 관세율 오름차순 정렬
          const sortedData = formattedData.sort((a: { 관세율구분: string; 관세율?: string }, b: { 관세율구분: string; 관세율?: string }) => {
            if (a.관세율구분 === 'A') return -1
            if (b.관세율구분 === 'A') return 1

            const rateA = parseFloat(a.관세율?.replace(/[^0-9.]/g, '') || '0')
            const rateB = parseFloat(b.관세율?.replace(/[^0-9.]/g, '') || '0')
            return rateA - rateB
          })

          setResults(sortedData)
        }

      } catch (error) {
        console.error('Error fetching HS Code details:', error)
        setError('데이터 조회 중 오류가 발생했습니다.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    if (hsCode.length === 10) {
      fetchHsCodeData()
    }
  }, [hsCode, ALLOWED_RATE_TYPES])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="my-4 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {results && results.length > 0 && (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-700">품목번호</p>
                      <p className="text-gray-900 font-mono">{item.품목번호}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-700">관세율구분</p>
                      <p className={`text-gray-900 ${
                        item.관세율구분 === 'A' ? 'font-bold text-blue-600' : ''
                      }`}>
                        {RATE_TYPE_MAPPING[item.관세율구분 as keyof typeof RATE_TYPE_MAPPING] || item.관세율구분 || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-700">관세율</p>
                      <p className="text-gray-900">{item.관세율 || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}