'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import xml2js from 'xml2js';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RequirementResult {
  dcerCfrmLworNm: string;
  reqCfrmIstmNm: string;
}

interface Item {
  dcerCfrmLworNm: string[];
  reqCfrmIstmNm: string[];
}

async function fetchRequirements(hsCode: string): Promise<RequirementResult[]> {
  const serviceKey = process.env.NEXT_PUBLIC_SERVICE_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
  const imexTpcd = 2;

  const url = `${apiUrl}?serviceKey=${serviceKey}&hsSgn=${hsCode}&imexTpcd=${imexTpcd}`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    console.log("API Response:", data); // 응답 전체를 로그로 출력하여 구조 확인

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(data);

    console.log("Parsed XML Result:", result); // 파싱된 결과 확인

    const items = result.response.body[0].items[0].item || [];
    return items.map((item: Item) => ({
      dcerCfrmLworNm: item.dcerCfrmLworNm[0],
      reqCfrmIstmNm: item.reqCfrmIstmNm[0],
    }));
  } catch (error) {
    console.error("Error fetching requirements:", error);
    throw error;
  }
}

interface RequirementDetail {
  description: string;
  exemption: string;
  application: string;
}

export default function ImportRequirementsCheckPage({ params }: { params: { hsCode: string } }) {
  const [requirements, setRequirements] = useState<RequirementResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requirementDetail, setRequirementDetail] = useState<RequirementDetail>({
    description: '',
    exemption: '',
    application: ''
  });
  const [selectedReqName, setSelectedReqName] = useState<string>('');
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirementsData = async () => {
      setIsLoading(true);

      try {
        const data = await fetchRequirements(params.hsCode);
        const uniqueData = data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.dcerCfrmLworNm === item.dcerCfrmLworNm && t.reqCfrmIstmNm === item.reqCfrmIstmNm),
        );
        setRequirements(uniqueData);
      } catch (error) {
        console.error(error);
        setRequirementDetail({
          description: '수입요건 조회 중 오류가 발생했습니다.',
          exemption: '수입요건 조회 중 오류가 발생했습니다.',
          application: '수입요건 조회 중 오류가 발생했습니다.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.hsCode) {
      fetchRequirementsData();
    }
  }, [params.hsCode]);

  const fetchRequirementDescriptions = async (reqCfrmIstmNm: string) => {
    try {
      const response = await fetch(`/api/requirements?reqCfrmIstmNm=${reqCfrmIstmNm}`);
      const data = await response.json();

      console.log('API Response:', data);

      // data.description에서 정보를 가져옴
      if (data && data.description) {
        const requirementInfo = data.description;
        console.log('Found requirement info:', requirementInfo);

        setRequirementDetail({
          description: requirementInfo.description || '해당 요건에 대한 설명이 없습니다.',
          exemption: requirementInfo.exemption || '면제 방법 정보가 없습니다.',
          application: requirementInfo.application || '신청 방법 정보가 없습니다.'
        });
      } else {
        console.log('No matching requirement info found for:', reqCfrmIstmNm);
        setRequirementDetail({
          description: '해당 요건에 대한 정보가 없습니다.',
          exemption: '해당 요건에 대한 정보가 없습니다.',
          application: '해당 요건에 대한 정보가 없습니다.'
        });
      }

      setSelectedReqName(reqCfrmIstmNm);
    } catch (error) {
      console.error('Error fetching requirements description:', error);
      setRequirementDetail({
        description: '정보를 불러오지 못했습니다.',
        exemption: '정보를 불러오지 못했습니다.',
        application: '정보를 불러오지 못했습니다.'
      });
    }
  };

  const handleRequirementClick = (requirement: RequirementResult) => {
    const requirementId = `${requirement.dcerCfrmLworNm}-${requirement.reqCfrmIstmNm}`;
    
    // 이미 펼쳐진 요건이라면 접기
    if (expandedRequirement === requirementId) {
      setExpandedRequirement(null);
    } else {
      // 새로운 요건이라면 펼치고 상세 정보 가져오기
      setExpandedRequirement(requirementId);
      fetchRequirementDescriptions(requirement.reqCfrmIstmNm);
    }
  };

  const formatText = (text: string | null | undefined) => {
    // text가 undefined, null, 빈 문자열인 경우를 모두 체크
    if (!text || typeof text !== 'string') {
      return <p className="text-gray-500">요건을 선택하여 정보를 확인하세요.</p>;
    }

    try {
      return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    } catch (error) {
      console.error('Error formatting text:', error);
      return <p className="text-gray-500">텍스트 형식이 올바르지 않습니다.</p>;
    }
  };

  // 각 요건이 현재 확장되어 있는지 확인하는 함수
  const isRequirementExpanded = (requirement: RequirementResult) => {
    const requirementId = `${requirement.dcerCfrmLworNm}-${requirement.reqCfrmIstmNm}`;
    return expandedRequirement === requirementId;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">수입요건 확인</h1>

      {/* 모바일 및 데스크톱 모두에서 표시할 상단 정보 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>조회 품목번호: {params.hsCode}</CardTitle>
        </CardHeader>
      </Card>

      {/* 안내메시지 Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <p className="text-gray-700">법령상 적용대상이 아닌 물품은 요건비대상으로 보면 됩니다</p>
        </CardContent>
      </Card>

      {/* 반응형 레이아웃 */}
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        {/* 요건 목록 */}
        <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : requirements.length > 0 ? (
            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="space-y-4">
                  <Card
                    onClick={() => handleRequirementClick(requirement)}
                    className={`cursor-pointer transition-all ${isRequirementExpanded(requirement) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-700">법령명</p>
                            <p className="text-gray-900">{requirement.dcerCfrmLworNm || '정보 없음'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-700">요건확인서</p>
                            <p className="text-gray-900">{requirement.reqCfrmIstmNm || '정보 없음'}</p>
                          </div>
                        </div>
                        <div className="ml-2">
                          {isRequirementExpanded(requirement) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 모바일용 상세 정보 - 확장된 경우에만 표시 */}
                  {isRequirementExpanded(requirement) && (
                    <div className="lg:hidden space-y-4 pl-2 pr-2 animate-fadeIn">
                      {/* 요건 설명 카드 */}
                      <Card className="bg-white shadow border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-blue-600">
                            요건 설명
                            {selectedReqName && (
                              <span className="text-sm text-gray-500 ml-2">({selectedReqName})</span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-4">
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {formatText(requirementDetail.description)}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 요건 면제방법 카드 */}
                      <Card className="bg-white shadow border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-green-600">
                            요건 면제방법
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-4">
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {formatText(requirementDetail.exemption)}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 요건 신청방법 카드 */}
                      <Card className="bg-white shadow border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-purple-600">
                            요건 신청방법
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-4">
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {formatText(requirementDetail.application)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-gray-500">해당 품목번호에 대한 수입요건이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 데스크톱용 상세 정보 패널 - 항상 표시 */}
        <div className="hidden lg:block lg:w-1/2 space-y-6">
          {/* 요건 설명 카드 */}
          <Card className="bg-white shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-blue-600 font-semibold">요건 설명</span>
                {selectedReqName && (
                  <span className="text-sm text-gray-500">({selectedReqName})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {formatText(requirementDetail.description)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 요건 면제방법 카드 */}
          <Card className="bg-white shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-green-600 font-semibold">요건 면제방법</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {formatText(requirementDetail.exemption)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 요건 신청방법 카드 */}
          <Card className="bg-white shadow-lg transition-all duration-200 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-purple-600 font-semibold">요건 신청방법</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {formatText(requirementDetail.application)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}