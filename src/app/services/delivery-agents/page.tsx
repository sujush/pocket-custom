'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, ExternalLink, Phone, Mail, MapPin, Award } from 'lucide-react';
import Papa from 'papaparse';

// 배송 대행업체 타입 정의
interface DeliveryAgent {
  업체명: string;
  연락처: string;
  '홈페이지': string;
}

// 추천 배송 대행업체 타입 정의
interface RecommendedAgent {
  name: string;
  expertise: string;
  location: string;
  contact: string;
  email: string;
}

export default function DeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<DeliveryAgent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('china');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 추천 업체 정보 - 실제 데이터로 교체 필요
  const recommendedAgent: RecommendedAgent = {
    name: "골드아시아",
    expertise: "중국 전지역 배송, 특수화물, 통관 대행 서비스",
    location: "인천광역시 중구 공항동로 296번길 97-49",
    contact: "070-8780-1231",
    email: "info@goldasia.co.kr"
  };

  // CSV 파일에서 데이터 가져오기
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/delivery-agents.csv');
      const text = await response.text();
      
      Papa.parse<DeliveryAgent>(text, {
        header: true,
        complete: (results) => {
          // 파싱 에러 확인
          if (results.errors.length > 0 && results.errors[0].row !== results.data.length - 1) {
            console.error('CSV 파싱 에러:', results.errors);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          } else {
            // 마지막 빈 행 제거
            const validData = results.data.filter((item: DeliveryAgent) =>
              item.업체명 && item.업체명.trim() !== ''
            );
            
            setAgents(validData);
            setFilteredAgents(validData);
            setError(null);
          }
          setLoading(false);
        },
        error: (error: Error) => {
          console.error('CSV 로딩 에러:', error);
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('데이터 로딩 에러:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(agent => 
        agent.업체명.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  // 국가 변경 핸들러
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    // 다른 국가 선택 시 추가 로직 구현 가능
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">배송대행업체 목록</h1>
      
      {/* 국가 선택 탭 */}
      <Tabs
        defaultValue="china"
        value={selectedCountry}
        onValueChange={handleCountryChange}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="china">중국</TabsTrigger>
          <TabsTrigger value="japan" disabled>
            일본 <Badge variant="outline" className="ml-1">준비중</Badge>
          </TabsTrigger>
          <TabsTrigger value="usa" disabled>
            미국 <Badge variant="outline" className="ml-1">준비중</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="china" className="space-y-6">
          {/* 검색 입력란 */}
          <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="업체명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm.trim() !== '' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm('')}
              >
                초기화
              </Button>
            )}
          </div>
          
          {/* 추천 업체 카드 */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                추천 배송대행업체
              </CardTitle>
              <CardDescription>
                가격, 서비스 품질, 고객 만족도를 종합적으로 고려하여 선정한 추천 업체입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-gray-500">업체명</p>
                  <p className="text-lg font-semibold">{recommendedAgent.name}</p>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-gray-500">주요 역량</p>
                  <p>{recommendedAgent.expertise}</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <p>{recommendedAgent.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p>{recommendedAgent.contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p>{recommendedAgent.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://goldasia.co.kr/', '_blank')}>
                배송비 확인하기 <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
              {error}
            </div>
          )}
          
          {/* 로딩 표시 */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* 업체 목록 */}
              {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent, index) => (
                    <Card key={index} className="h-full hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{agent.업체명}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <p>{agent.연락처}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => window.open(agent['홈페이지'], '_blank')}
                        >
                          배송비 확인 <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="japan">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">일본 배송대행 서비스는 준비 중입니다.</p>
            <p className="text-gray-400 mt-2">조금만 기다려 주세요!</p>
          </div>
        </TabsContent>
        
        <TabsContent value="usa">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">미국 배송대행 서비스는 준비 중입니다.</p>
            <p className="text-gray-400 mt-2">조금만 기다려 주세요!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}